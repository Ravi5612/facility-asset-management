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
    queryFn: authService.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

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
