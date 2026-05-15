"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { fetchMe, setInitialized, isInitialized, clearAuth } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await fetchMe();
      } catch (error) {
        clearAuth();
        console.error("[AuthInitializer] Failed to fetch user profile", error);
      } finally {
        setInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [clearAuth, fetchMe, setInitialized, isInitialized]);

  return <>{children}</>;
}
