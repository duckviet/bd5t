import { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  ClientRequest,
  type StreamEvent,
  type StreamRequestConfig,
} from "./ClientRequest";

// Orval expects (url, config), while some manual calls might use (config)
export const customInstance = <T>(
  urlOrConfig: string | AxiosRequestConfig,
  config?: any,
): Promise<T> => {
  const clientInstance = ClientRequest.getInstance();
  const axiosInstance = clientInstance.getAxiosInstance();

  let finalConfig: any;

  if (typeof urlOrConfig === "string") {
    // Trường hợp Orval gọi: customInstance(url, config)
    finalConfig = {
      url: urlOrConfig,
      ...config,
      // Orval dùng 'body' cho fetch, Axios dùng 'data'
      data: config?.data || config?.body,
    };
  } else {
    // Trường hợp gọi thủ công: customInstance({ url, ... })
    finalConfig = urlOrConfig;
  }

  return axiosInstance
    .request<T>(finalConfig)
    .then((response: AxiosResponse<T>) => {
      return response.data;
    });
};

export const streamInstance = (config: StreamRequestConfig): Promise<void> => {
  return ClientRequest.getInstance().stream(config);
};

export type { StreamEvent, StreamRequestConfig };

export default customInstance;