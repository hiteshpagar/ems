import { ActivityIndicator, View } from "react-native";
import { useContext, useEffect } from "react";
import { router } from "expo-router";

import { AuthContext } from "../context/AuthContext";

export default function Index() {
  const { userToken, userRole, loading } = useContext(AuthContext);

  useEffect(() => {
    if (loading) return;

    if (userToken) {
      if (userRole === "SUPER_ADMIN") {
        router.replace("/super-admin-dashboard");
      } else if (userRole === "ADMIN") {
        router.replace("/admin-dashboard" as any);
      } else {
        router.replace("/dashboard");
      }
    } else {
      router.replace("/login");
    }
  }, [userToken, userRole, loading]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}
