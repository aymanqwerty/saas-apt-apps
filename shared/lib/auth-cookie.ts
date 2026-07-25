import { AUTH_COOKIE_NAME } from "@/shared/constants/auth";

// Matches the backend access-token lifetime (ACCESS_TOKEN_EXPIRE_MINUTES = 60*24).
const MAX_AGE_SECONDS = 60 * 60 * 24;

/**
 * Write the auth token to a first-party cookie from the browser.
 *
 * The cookie is intentionally not httpOnly (client fetches read it to send a
 * Bearer header to the cross-domain API), so the browser can set it directly —
 * no server round-trip. `proxy.ts` route-gating and the server-side
 * `getServerDoctor()` read this same cookie on the next request.
 */
export function setAuthCookie(token: string): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}` +
    `; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
