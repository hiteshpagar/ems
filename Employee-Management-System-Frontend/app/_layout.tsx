import { Stack, router, useSegments } from "expo-router";
import { useContext, useEffect } from "react";

import { AuthContext, AuthProvider } from "../context/AuthContext";

function MainLayout() {
  const { userToken, loading } = useContext(AuthContext);

  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthScreen = segments[0] === "login" || segments[0] === "register";

    // User NOT Logged In
    if (!userToken && !inAuthScreen) {
      router.replace("/login");
    }

    // User Logged In
    if (userToken && inAuthScreen) {
      router.replace("/");
    }
  }, [userToken, loading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
