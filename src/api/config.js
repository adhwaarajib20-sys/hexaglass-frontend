import axios from "axios";
import { Platform } from "react-native";
import storage from "../utils/storage";

// Smart API URL selection untuk web dan mobile
const getApiUrl = () => {
  // Priority 1: Environment variable dari .env
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log("✅ config.js: Using EXPO_PUBLIC_API_URL from .env");
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Priority 2: Web platform
  if (Platform.OS === "web") {
    console.log("✅ config.js: Web platform detected - localhost");
    return "http://localhost:8000/api";
  }

  // Priority 3: Mobile (Expo Go di HP)
  console.log("✅ config.js: Mobile platform detected - using IP");
  return "http://192.168.1.9:8000/api";
};

const BASE_URL = getApiUrl();
console.log("🔌 API Base URL (config.js):", BASE_URL);
console.log("📱 Platform:", Platform.OS);

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

// Error interceptor untuk debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API ERROR:", {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
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
