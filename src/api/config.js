import axios from "axios";
import storage from "../utils/storage";

const BASE_URL = "http://10.68.198.192:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(
          "🔐 Token attached to request:",
          token.substring(0, 20) + "...",
        );
      } else {
        console.warn("⚠️ No token found in storage");
      }
    } catch (error) {
      console.log("❌ Interceptor error:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem("token");
      await storage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

export default api;
