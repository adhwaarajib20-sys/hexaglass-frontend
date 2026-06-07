import axios from "axios";
import { Platform } from "react-native";
import storage from "../utils/storage";

// Smart API URL selection untuk web dan mobile
const getApiUrl = () => {
  // Priority 1: Environment variable dari .env
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log("✅ auth.js: Using EXPO_PUBLIC_API_URL from .env");
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Priority 2: Web platform
  if (Platform.OS === "web") {
    console.log("✅ auth.js: Web platform detected - localhost");
    return "http://localhost:8000/api";
  }

  // Priority 3: Mobile (Expo Go di HP)
  console.log("✅ auth.js: Mobile platform detected - using IP");
  return "http://192.168.1.9:8000/api";
};

const BASE_URL = getApiUrl();
console.log("🔌 API Base URL (auth.js):", BASE_URL);
console.log("📱 Platform:", Platform.OS);

// Buat instance axios langsung di sini
const authApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const login = (email, password) =>
  authApi.post("/auth/login", { email, password });

export const register = (data) => authApi.post("/auth/register", data);

export const logout = async () => {
  try {
    const token = await storage.getItem("token");
    return await authApi.post(
      "/auth/logout",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  } catch (e) {
    console.log("logout api error:", e);
  }
};

export const getMe = async () => {
  const token = await storage.getItem("token");
  return authApi.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
};
