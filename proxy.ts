import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "@/shared/constants/auth";

/**
 * Optimistic route protection (Next.js 16 proxy, formerly middleware).
 * Only checks cookie presence — the API validates the token on every request.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
