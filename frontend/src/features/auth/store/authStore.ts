import { create } from "zustand";
import { me, UserProfile } from "@/services/generated/api";

import Cookies from "js-cookie";

type AuthState = {
  isAuth: boolean | null;
  user: UserProfile | null;
  isRefreshing: boolean;
  isInitialized: boolean;
};

type AuthAction = {
  login: () => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  removeUser: () => void;
  fetchMe: () => Promise<void>;
  setRefreshing: (status: boolean) => void;
  setInitialized: (status: boolean) => void;
};

const initialState: AuthState = {
  isAuth: null,
  user: null,
  isRefreshing: false,
  isInitialized: false,
};

type AuthStore = AuthState & AuthAction;

export const useAuthStore = create<AuthStore>()((set) => ({
  ...initialState,
  login() {
    set({ isAuth: true });
  },
  logout() {
    set({
      isAuth: false,
      user: null,
      isRefreshing: false,
      isInitialized: true,
    });

    // Dynamic import để tránh circular dependency tạm thời (sẽ gỡ sau)
    import("@/services/axios/ClientRequest")
      .then(({ ClientRequest }) => {
        ClientRequest.getInstance().cancelRefresh();
      })
      .catch(() => {});
  },
  setUser(user: UserProfile) {
    set({ user });
  },
  removeUser: () => set({ user: null }),
  fetchMe: async () => {
    // Nếu không có token, ta coi như chưa auth và không cần gọi API để tránh lỗi 401
    if (!Cookies.get("access_token") && !Cookies.get("refresh_token")) {
      set({ user: null, isAuth: false });
      return;
    }

    try {
      const response: any = await me();
      // Vì customInstance trả về trực tiếp response.data, ta check bằng response.success thay vì status
      if (response.success || (response.data && (response.data.id || response.data.email))) {
        set({ user: response.data || response, isAuth: true });
      } else {
        set({ user: null, isAuth: false });
      }
    } catch (error: any) {
      set({ user: null, isAuth: false });
      // Nếu lỗi là 401, ta không throw để AuthInitializer không log error, vì đây là trạng thái guest bình thường
      if (error?.response?.status !== 401) {
        throw error;
      }
    }
  },
  setRefreshing: (status: boolean) => {
    set({ isRefreshing: status });
  },
  setInitialized: (status: boolean) => {
    set({ isInitialized: status });
  },
}));
