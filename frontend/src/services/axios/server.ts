"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

export default async function server(path: string, options: RequestInit = {}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const headers: Record<string, string> = {
      ...options.headers,
    } as Record<string, string>;

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      // Bắt 401 trên server để redirect về login
      if (res.status === 401) {
        redirect("/login?logout=true");
      }

      // Tránh crash nếu response không phải JSON
      const errorData = await res
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw errorData;
    }

    return await res.json().catch(() => ({}));
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      // Đây là lỗi redirect() của Next.js ném chặn để thoát SSR execution block, throw tiếp để nó hoạt động
      throw error;
    }
    throw error;
  }
}
