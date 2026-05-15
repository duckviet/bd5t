import { create } from "zustand";
import { me, type UserProfile } from "@/services/generated/api";

type AuthState = {
  isAuth: boolean | null;
  user: UserProfile | null;
  isInitialized: boolean;
};

type AuthAction = {
  setAuth: (user: UserProfile | null) => void;
  clearAuth: () => void;
  fetchMe: () => Promise<void>;
  setInitialized: (status: boolean) => void;
};

const initialState: AuthState = {
  isAuth: null,
  user: null,
  isInitialized: false,
};

type AuthStore = AuthState & AuthAction;

type AuthErrorLike = {
  response?: {
    status?: number;
  };
};

const isUnauthorizedError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const authError = error as AuthErrorLike;
  return authError.response?.status === 401;
};

let authLogoutListenerAttached = false;

export const useAuthStore = create<AuthStore>()((set) => ({
  ...initialState,
  setAuth(user: UserProfile | null) {
    set({
      user,
      isAuth: true,
    });
  },
  clearAuth() {
    set({
      isAuth: false,
      user: null,
      isInitialized: true,
    });
  },
  fetchMe: async () => {
    try {
      const response = await me();
      const user = response.data ?? null;

      if (user?.id || user?.email) {
        set({ user, isAuth: true });
      } else {
        set({ user: null, isAuth: false });
      }
    } catch (error: unknown) {
      set({ user: null, isAuth: false });
      // Nếu lỗi là 401, ta không throw để AuthInitializer không log error, vì đây là trạng thái guest bình thường
      if (!isUnauthorizedError(error)) {
        throw error;
      }
    }
  },
  setInitialized: (status: boolean) => {
    set({ isInitialized: status });
  },
}));

if (typeof window !== "undefined") {
  if (!authLogoutListenerAttached) {
    window.addEventListener("auth:logout", () => {
      useAuthStore.getState().clearAuth();
    });
    authLogoutListenerAttached = true;
  }
}
