import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [userToken, setUserToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // Check Login On App Start
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        setUserToken(token);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (token: string) => {
    await AsyncStorage.setItem("token", token);

    setUserToken(token);
  };

  // Logout
  const logout = async () => {
    await AsyncStorage.removeItem("token");

    setUserToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
