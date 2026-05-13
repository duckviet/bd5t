import Cookies from "js-cookie";
import { customInstance } from "../axios";
import { triggerLogout } from "../axios/ClientRequest";

export const AUTH_REDIRECT_URL = "/login?logout=true";

// ====================== API CALLS ======================
export const refreshTokenApi = (
  refreshTokenBody: { refresh_token?: string },
  signal?: AbortSignal,
) => {
  return customInstance<{
    accessToken?: string;
    refreshToken?: string;
  }>({
    url: `/auth/refresh-token`,
    method: "POST",
    data: refreshTokenBody,
    signal,
  });
};

export const logoutApi = (signal?: AbortSignal) => {
  return customInstance<void>({ url: `/auth/logout`, method: "POST", signal });
};

// ====================== AUTH ACTION ======================
const authAction = {
  // Lưu accessToken vào cookie
  setAccessToken(token: string) {
    Cookies.set("access_token", token, {
      expires: 1,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  },

  // Refresh token
  async refreshToken(customRefreshToken?: string) {
    const refreshToken = customRefreshToken || Cookies.get("refresh_token");

    const response = await refreshTokenApi({
      refresh_token: refreshToken,
    });

    if (response.accessToken) {
      this.setAccessToken(response.accessToken);
    }

    return response;
  },

  // Logout
  async logout() {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      this.handleLogoutCleanup();
    }
  },

  // Dọn dẹp và redirect
  handleLogoutCleanup() {
    triggerLogout();
  },
};

export default authAction;
