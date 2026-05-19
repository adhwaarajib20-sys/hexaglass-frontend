import axios from "axios";
import storage from "../utils/storage";

const BASE_URL = "http://10.68.198.192:8000/api";

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
