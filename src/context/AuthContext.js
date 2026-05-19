import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, logout as logoutApi } from "../api/auth";
import storage from "../utils/storage";

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} name
 * @property {"admin" | "operator" | "satpam" | "supir"} role
 * @property {any} [key: string]
 */

/** @type {React.Context<{user: User | null, token: string | null, loading: boolean, login: Function, logout: Function} | null>} */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getItem("token");
      const storedUser = await storage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log("loadStoredAuth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await loginApi(email, password);
    const { token, user } = response.data.data;
    await storage.setItem("token", String(token));
    await storage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.log("logout error:", error);
    } finally {
      await storage.removeItem("token");
      await storage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
