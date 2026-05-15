import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { useEditTokenStore } from "@/stores/editTokenStore";

interface FailedRequestQueueItem {
  resolve: () => void;
  reject: (reason: unknown) => void;
}

export interface StreamEvent {
  event: string;
  payload: unknown;
}

export interface StreamRequestConfig {
  url: string;
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  onEvent?: (event: StreamEvent) => void | Promise<void>;
  skipAuthInterceptor?: boolean;
}

// Hàm logout dọn dẹp cơ bản khi Refresh Token thất bại
export const triggerLogout = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:logout"));

    const currentUrl = new URL(window.location.href);
    const alreadyOnLogoutLoginPage =
      currentUrl.pathname === "/login" &&
      currentUrl.searchParams.get("logout") === "true";

    if (!alreadyOnLogoutLoginPage) {
      window.location.replace("/login?logout=true");
    }
  }
};

export class ClientRequest {
  private static instance: ClientRequest | null = null;
  private static authLogoutListenerAttached = false;
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: FailedRequestQueueItem[] = [];
  private readonly handleAuthLogout = () => {
    this.cancelRefresh();
  };

  public static getInstance(): ClientRequest {
    if (!ClientRequest.instance) {
      ClientRequest.instance = new ClientRequest();
    }
    return ClientRequest.instance;
  }

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1",
      timeout: 30000,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    this.axiosInstance.interceptors.request.use(
      (config) => {
        const editToken = useEditTokenStore.getState().editToken;
        if (editToken) {
          config.headers["X-Edit-Token"] = editToken;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
          skipAuthInterceptor?: boolean;
        };

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.skipAuthInterceptor
        ) {
          originalRequest._retry = true;

          try {
            await this.waitForRefresh();
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );

    if (
      typeof window !== "undefined" &&
      !ClientRequest.authLogoutListenerAttached
    ) {
      window.addEventListener("auth:logout", this.handleAuthLogout);
      ClientRequest.authLogoutListenerAttached = true;
    }
  }

  private async waitForRefresh(): Promise<void> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:refreshing:start"));
    }

    try {
      await axios.post(
        `${this.axiosInstance.defaults.baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      this.processQueue(null);
    } catch (error) {
      this.processQueue(
        error instanceof Error ? error : new Error("Refresh failed"),
      );
      triggerLogout();
      throw error;
    } finally {
      this.isRefreshing = false;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:refreshing:end"));
      }
    }
  }

  private processQueue(error: Error | null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve();
      }
    });
    this.failedQueue = [];
  }

  private getCommonHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const editToken = useEditTokenStore.getState().editToken;
    if (editToken) headers["X-Edit-Token"] = editToken;

    return headers;
  }

  public async stream(config: StreamRequestConfig): Promise<void> {
    const normalizedUrl = config.url.startsWith("/")
      ? config.url
      : `/${config.url}`;
    const url = `${this.axiosInstance.defaults.baseURL}${normalizedUrl}`;

    const method = config.method || "POST";
    const headers: Record<string, string> = {
      ...this.getCommonHeaders(),
      Accept: "text/event-stream",
      ...(config.headers || {}),
    };

    const executeRequest = async (currentHeaders: Record<string, string>) => {
      return fetch(url, {
        method,
        credentials: "include",
        headers: currentHeaders,
        body: config.data ? JSON.stringify(config.data) : undefined,
        signal: config.signal,
      });
    };

    let response = await executeRequest(headers);

    if (response.status === 401 && !config.skipAuthInterceptor) {
      try {
        await this.waitForRefresh();
        response = await executeRequest(headers);
      } catch {
        throw new Error("Session expired");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw errorData.error || new Error(`Request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Stream response body is empty");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true }).replace(/\r/g, "");
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() || "";

      for (const chunk of chunks) {
        const parsed = this.parseEventBlock(chunk);
        if (parsed && config.onEvent) await config.onEvent(parsed);
      }
    }
  }

  private parseEventBlock(block: string): StreamEvent | null {
    const lines = block.split("\n").map((line) => line.trimEnd());
    let eventName = "message";
    const dataLines: string[] = [];

    for (const line of lines) {
      if (!line || line.startsWith(":")) continue;
      if (line.startsWith("event:")) {
        eventName = line.slice("event:".length).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trimStart());
      }
    }

    if (!dataLines.length) return null;
    const rawData = dataLines.join("\n");
    try {
      return { event: eventName, payload: JSON.parse(rawData) };
    } catch {
      return { event: eventName, payload: rawData };
    }
  }

  public getAxiosInstance() {
    return this.axiosInstance;
  }

  public cancelRefresh() {
    this.isRefreshing = false;
    this.processQueue(new Error("Refresh cancelled"));
  }
}
