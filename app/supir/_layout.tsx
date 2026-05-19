import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function SupirLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1a56db",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e5e7eb",
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan & Daftar",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📷</Text>,
        }}
      />
      <Tabs.Screen
        name="antrean"
        options={{
          title: "Status Antrean",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎫</Text>,
        }}
      />
      <Tabs.Screen
        name="laporan"
        options={{
          title: "Laporan",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📝</Text>,
        }}
      />
      <Tabs.Screen
        name="form-laporan"
        options={{
          title: "Buat Laporan",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>➕</Text>,
        }}
      />
    </Tabs>
  );
}
