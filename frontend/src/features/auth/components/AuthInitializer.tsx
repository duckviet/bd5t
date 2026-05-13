"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { fetchMe, setInitialized, isInitialized, logout } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await fetchMe();
      } catch (error) {
        useAuthStore.setState({ isAuth: false, user: null });
        console.error("[AuthInitializer] Failed to fetch user profile", error);
      } finally {
        setInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [fetchMe, setInitialized, isInitialized]);

  useEffect(() => {
    // Lắng nghe sự kiện auth:logout từ ClientRequest
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener("auth:logout", handleLogoutEvent);
    return () => window.removeEventListener("auth:logout", handleLogoutEvent);
  }, [logout]);

  return <>{children}</>;
}
