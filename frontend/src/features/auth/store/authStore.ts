import { create } from "zustand";
import { me, UserProfile } from "@/services/generated/api";

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
    try {
      const response: any = await me();
      // Vì customInstance trả về trực tiếp response.data, ta check bằng response.success thay vì status
      if (response.success || (response.data && response.data.id)) {
        set({ user: response.data || response, isAuth: true });
      } else {
        set({ user: null, isAuth: false });
      }
    } catch (error) {
      set({ user: null, isAuth: false });
      throw error;
    }
  },
  setRefreshing: (status: boolean) => {
    set({ isRefreshing: status });
  },
  setInitialized: (status: boolean) => {
    set({ isInitialized: status });
  },
}));
