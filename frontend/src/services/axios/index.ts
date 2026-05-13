import { ClientRequest } from "./ClientRequest";

const clientInstance = ClientRequest.getInstance();
const client = clientInstance.getAxiosInstance();

export { default as server } from "./server";
export { ClientRequest, client, clientInstance };
export * from "./types";
export { customInstance, streamInstance } from "./custom-instance";