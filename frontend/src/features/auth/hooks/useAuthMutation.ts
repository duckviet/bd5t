import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  login,
  register,
  type AuthResponse,
  type Login200,
  LoginRequest,
  type Register201,
  RegisterRequest,
  type UserProfile,
} from "@/services/generated/api";
import { useAuthStore } from "@/features/auth/store/authStore";

type AuthMutationResponse = {
  success?: boolean;
  data?: AuthResponse;
  accessToken?: string;
  refreshToken?: string;
  user?: UserProfile;
};

function getAuthResponsePayload(
  response: AuthMutationResponse,
): AuthResponse | AuthMutationResponse {
  return response.data ?? response;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const authError = error as {
      response?: { data?: { error?: { message?: string } } };
      message?: string;
    };

    return (
      authError.response?.data?.error?.message || authError.message || fallback
    );
  }

  return fallback;
}

export function useLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response: Login200) => {
      // Vì customInstance đang return response.data trực tiếp, ta dùng success thay vì status
      if (response.success || response.data?.accessToken) {
        const payload = getAuthResponsePayload(
          response as AuthMutationResponse,
        );
        const user = payload.user ?? null;
        const store = useAuthStore.getState();

        store.setAuth(user);
        toast.success("Đăng nhập thành công!");

        // Điều hướng về trang chủ
        router.push("/");
        router.refresh(); // Buộc Next.js refresh lại các Server Components (như Navbar nếu có)
      }
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(
        error,
        "Đăng nhập thất bại. Vui lòng kiểm tra lại!",
      );
      toast.error(message);
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: (response: Register201) => {
      if (response.success || response.data?.user) {
        const payload = getAuthResponsePayload(
          response as AuthMutationResponse,
        );
        const user = payload.user ?? null;
        const store = useAuthStore.getState();

        store.setAuth(user);
        toast.success("Đăng ký thành công!");
        router.push("/");
        router.refresh();
      }
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(
        error,
        "Đăng ký thất bại. Vui lòng thử lại!",
      );
      toast.error(message);
    },
  });
}
