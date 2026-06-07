import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";

export default function SatpamLayout() {
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
        name="qr"
        options={{
          title: "Barcode",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="qr-code-2" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="validasi"
        options={{
          title: "Validasi",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="check-circle"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="antrean"
        options={{
          title: "Monitor",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="visibility" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="laporan"
        options={{
          title: "Laporan",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
