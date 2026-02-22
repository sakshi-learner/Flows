"use client";

import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<void>;
  facebookLogin: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

const FB_START_URL = "http://localhost:5000/api/oauth/facebook/start";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const verifyAuth = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ correct endpoint
      const res = await api<{ success: boolean; user?: User; message?: string }>("api/auth/verify");

      if (res.success && res.user?.id) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api<{ success: boolean; user?: User; message?: string }>("api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (!res.success || !res.user?.id) {
        throw new Error(res.message || "Login failed");
      }

      setUser(res.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const facebookLogin = useCallback(() => {
    window.location.href = FB_START_URL;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      verifyAuth,
      facebookLogin,
    }),
    [user, loading, login, logout, verifyAuth, facebookLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
