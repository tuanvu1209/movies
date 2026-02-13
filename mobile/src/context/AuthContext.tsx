import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProfile } from "../lib/api";
import { User } from "../types/user";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (params: { user: User; token: string; rememberMe?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        if (!savedToken) {
          return;
        }
        const profile = await getProfile(savedToken);
        setToken(savedToken);
        setUser(profile);
      } catch {
        await AsyncStorage.multiRemove(["token", "rememberMe"]);
      } finally {
        setLoading(false);
      }
    }

    void restoreSession();
  }, []);

  const signIn = useCallback(async (params: { user: User; token: string; rememberMe?: boolean }) => {
    setUser(params.user);
    setToken(params.token);
    await AsyncStorage.setItem("token", params.token);
    if (params.rememberMe) {
      await AsyncStorage.setItem("rememberMe", "true");
    } else {
      await AsyncStorage.removeItem("rememberMe");
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(["token", "rememberMe"]);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      signIn,
      logout,
    }),
    [user, token, loading, signIn, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
