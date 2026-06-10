import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getLocalAuthSession,
  subscribeToLocalAuth,
} from "../services/localAuthService";

/* eslint-disable react-refresh/only-export-components */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getLocalAuthSession());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return subscribeToLocalAuth((nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      isLoading,
    }),
    [isLoading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
