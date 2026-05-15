import { customInstance } from "../axios";
import { triggerLogout } from "../axios/ClientRequest";

export const logoutApi = (signal?: AbortSignal) => {
  return customInstance<void>({ url: `/auth/logout`, method: "POST", signal });
};

// ====================== AUTH ACTION ======================
const authAction = {
  async logout() {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      triggerLogout();
    }
  },
};

export default authAction;
