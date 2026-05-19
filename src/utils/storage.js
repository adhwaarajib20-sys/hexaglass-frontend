import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const storage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.log("storage.getItem error:", e);
      return null;
    }
  },

  setItem: async (key, value) => {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, String(value));
    } catch (e) {
      console.log("storage.setItem error:", e);
    }
  },

  removeItem: async (key) => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.log("storage.removeItem error:", e);
    }
  },
};

export default storage;
