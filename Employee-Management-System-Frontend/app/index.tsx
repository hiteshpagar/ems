import { ActivityIndicator, View } from "react-native";

import { useEffect } from "react";

import { router } from "expo-router";

import { getToken } from "../utils/storage";

export default function Index() {
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await getToken();

    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  };

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
