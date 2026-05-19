import { Stack, router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

function RootLayoutNav() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // Redirect berdasarkan role
    switch (user.role) {
      case "admin":
        router.replace("/admin/dashboard");
        break;
      case "operator":
        router.replace("/operator/antrean");
        break;
      case "satpam":
        router.replace("/satpam/qr");
        break;
      case "supir":
        router.replace("/supir/scan");
        break;
      default:
        router.replace("/login");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="modal" />
      <Stack.Screen name="supir" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="operator" />
      <Stack.Screen name="satpam" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
