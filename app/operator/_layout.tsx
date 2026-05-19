import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function OperatorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1a7a2e",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          paddingBottom: 8,
          paddingTop: 6,
          height: 62,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="antrean"
        options={{
          title: "Antrean",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="laporan"
        options={{
          title: "Laporan",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>📝</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="perusahaan"
        options={{
          title: "Perusahaan",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>🏢</Text>
          ),
        }}
      />
    </Tabs>
  );
}
