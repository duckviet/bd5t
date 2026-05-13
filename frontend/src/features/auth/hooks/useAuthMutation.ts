import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  login,
  register,
  LoginRequest,
  RegisterRequest,
} from "@/services/generated/api";
import { useAuthStore } from "@/features/auth/store/authStore";
import authAction from "@/services/actions/auth.action";
import Cookies from "js-cookie";

export function useLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response: any) => {
      // Vì customInstance đang return response.data trực tiếp, ta dùng success thay vì status
      if (
        response.success ||
        response.accessToken ||
        response.data?.accessToken
      ) {
        const payload = response.data || response;
        const { accessToken, refreshToken, user } = payload;
        const store = useAuthStore.getState();

        if (accessToken) {
          authAction.setAccessToken(accessToken);
        }

        if (refreshToken) {
          Cookies.set("refresh_token", refreshToken, {
            expires: 7,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
        }

        if (user) {
          store.setUser(user);
        }

        store.login(); // Đặt isAuth = true
        toast.success("Đăng nhập thành công!");

        // Điều hướng về trang chủ
        router.push("/");
        router.refresh(); // Buộc Next.js refresh lại các Server Components (như Navbar nếu có)
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại!";
      toast.error(message);
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: (response: any) => {
      if (response.success || response.data?.user) {
        const payload = response.data || response;
        const { accessToken, refreshToken, user } = payload;
        const store = useAuthStore.getState();

        if (accessToken) {
          authAction.setAccessToken(accessToken);
        }

        if (refreshToken) {
          Cookies.set("refresh_token", refreshToken, {
            expires: 7,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
        }

        if (user) {
          store.setUser(user);
        }

        store.login();
        toast.success("Đăng ký thành công!");
        router.push("/");
        router.refresh();
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Đăng ký thất bại. Vui lòng thử lại!";
      toast.error(message);
    },
  });
}
