"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: any;
  isLoading: boolean;
  refetch: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refetch: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      console.log("[AuthProvider] Fetching user from /api/auth/me");
      const res = await authService.getMe();
      console.log("[AuthProvider] Response from /auth/me:", res);
      return res;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  useEffect(() => {
    console.log("[AuthProvider] State changed:", { user, isLoading });
  }, [user, isLoading]);

  const logout = async () => {
    await authService.logout();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, refetch, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
