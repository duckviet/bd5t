import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Hàm check đơn giản không verify signature (để performance tốt ở middleware)
function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    // Replace '-' with '+' and '_' with '/' for base64url decoding
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const decodedJson = atob(base64);
    const claims = JSON.parse(decodedJson);
    if (!claims || !claims.exp) return true;
    const currentTime = Date.now() / 1000;
    // Thêm buffer 10s để tránh lệch giờ
    return claims.exp < currentTime - 10;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isJustLoggedOut = searchParams.get("logout") === "true";

  if (pathname.startsWith("/.well-known")) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isAccessTokenValid = accessToken && !isTokenExpired(accessToken);
  const canRefresh = refreshToken && !isTokenExpired(refreshToken);
  const isAuthenticated = isAccessTokenValid || canRefresh;
  console.log(
    `[Middleware] Path: ${pathname}, AccessToken: ${isAccessTokenValid ? "valid" : "invalid"}, RefreshToken: ${canRefresh ? "valid" : "invalid"}, JustLoggedOut: ${isJustLoggedOut}`,
  );

  const authPaths = ["/login", "/register", "/auth"];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Các route cho phép truy cập mà không cần đăng nhập
  const publicPaths = ["/", "/activities", "/activities", "/criteria" , "/leaderboard"];
  const isPublicPath = publicPaths.includes(pathname) || isAuthPath;

  // 1. Đã đăng nhập mà vào trang Auth -> Đá về Home
  if (isAuthPath && isAuthenticated && !isJustLoggedOut) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Chạm vào private route mà chưa đăng nhập -> Đá về Login
  if (!isPublicPath && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();

  response.headers.set(
    "x-auth-status",
    isAuthenticated ? "authenticated" : "unauthenticated",
  );

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|\.well-known).*)"],
};
