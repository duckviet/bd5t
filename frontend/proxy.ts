import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/.well-known")) {
    return NextResponse.next();
  }

  // Auth cookies are set by the backend host in production, so this proxy
  // cannot reliably read them on bd5t.vercel.app. Client-side auth state and
  // backend 401 responses are the source of truth for protected data.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|\.well-known).*)"],
};
