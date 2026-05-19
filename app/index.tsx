import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  // Redirect berdasarkan role
  if (user.role === "admin") {
    return <Redirect href={"/admin" as any} />;
  } else if (user.role === "operator") {
    return <Redirect href={"/operator" as any} />;
  } else if (user.role === "satpam") {
    return <Redirect href={"/satpam" as any} />;
  } else if (user.role === "supir") {
    return <Redirect href={"/supir" as any} />;
  }

  return <Redirect href="/login" />;
}
