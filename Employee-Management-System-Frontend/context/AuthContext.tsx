import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [userToken, setUserToken] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);

  const [userName, setUserName] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // Check Login On App Start
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const role = await AsyncStorage.getItem("role");

      const fullName = await AsyncStorage.getItem("fullName");

      if (token) {
        setUserToken(token);
        setUserRole(role);
        setUserName(fullName);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (token: string, role: string, fullName: string) => {
    await AsyncStorage.setItem("token", token);

    await AsyncStorage.setItem("role", role);

    await AsyncStorage.setItem("fullName", fullName);

    setUserToken(token);

    setUserRole(role);

    setUserName(fullName);
  };
  // Logout
  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "role", "fullName"]);

    setUserToken(null);

    setUserRole(null);

    setUserName(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userRole,
        userName,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
