"use server";

import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/shared/constants/auth";

// Matches the backend access-token lifetime (ACCESS_TOKEN_EXPIRE_MINUTES = 60*24).
const MAX_AGE_SECONDS = 60 * 60 * 24;

/**
 * Persist the auth token in a FIRST-PARTY cookie on the frontend's own origin.
 *
 * The backend also sets its own `access_token` cookie, but when the frontend
 * (Vercel) and API (Cloud Run) live on different domains that cookie is
 * cross-site — the browser won't store a SameSite=Lax cookie set from a
 * cross-site request, and even if it did the Vercel server couldn't read it.
 * Storing the token ourselves keeps `proxy.ts` route-gating and the server-side
 * `getServerDoctor()` Bearer call working regardless of where the API is hosted.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
}
