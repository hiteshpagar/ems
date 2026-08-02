import { createContext, useEffect, useState } from "react";
import {
  clearRememberedSession,
  getRememberedSession,
  saveRememberedSession,
  setSessionToken,
} from "../utils/storage";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [userToken, setUserToken] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);

  const [userName, setUserName] = useState<string | null>(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // Check Login On App Start
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const session = await getRememberedSession();

      if (session) {
        setUserToken(session.token);
        setUserRole(session.role ?? null);
        setUserName(session.fullName ?? null);
        setUserEmail(session.email ?? null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (
    token: string,
    role: string,
    fullName: string,
    email: string,
    rememberMe: boolean,
  ) => {
    if (rememberMe) {
      await saveRememberedSession(token, role, fullName, email);
    } else {
      await clearRememberedSession();
      setSessionToken(token);
    }

    setUserToken(token);

    setUserRole(role);

    setUserName(fullName);

    setUserEmail(email);
  };
  // Logout
  const logout = async () => {
    await clearRememberedSession();

    setUserToken(null);

    setUserRole(null);

    setUserName(null);

    setUserEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userRole,
        userName,
        userEmail,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
