import axios, { type AxiosProgressEvent } from "axios";
import { urls } from "@/config";

const api = axios.create({
  baseURL: `${urls.httProtocol}${urls.serverUrl}`|| "http://localhost:8000/api",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export { AxiosProgressEvent };
export default api;
