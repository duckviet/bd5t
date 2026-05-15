import type { AxiosError, AxiosRequestConfig } from "axios";
import {
  ClientRequest,
  type StreamEvent,
  type StreamRequestConfig,
} from "./ClientRequest";

// Hàm xử lý Request cho Orval
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig, // Đề phòng trường hợp bạn truyền thêm options từ component
): Promise<T> => {
  const axiosInstance = ClientRequest.getInstance().getAxiosInstance();

  // Merge config do Orval sinh ra và options (nếu có)
  const finalConfig: AxiosRequestConfig = {
    ...config,
    ...options,
    headers: {
      ...(config.headers ?? {}),
      ...(options?.headers ?? {}),
    },
    params: {
      ...(config.params ?? {}),
      ...(options?.params ?? {}),
    },
  };

  return axiosInstance
    .request<T>(finalConfig)
    .then((response) => response.data);
};

// Hàm xử lý Stream (giữ nguyên của bạn)
export const streamInstance = (config: StreamRequestConfig): Promise<void> => {
  return ClientRequest.getInstance().stream(config);
};

// Khai báo các Type bắt buộc mà Orval cần để generate
export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
export type { StreamEvent, StreamRequestConfig };

export default customInstance;