import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/shared/constants/auth";
import { isDemoToken } from "@/shared/constants/demo";
import { apiFetch } from "@/shared/services/api/client";
import { DEMO_DOCTOR } from "@/shared/services/api/demo.data";
import type { Doctor } from "@/shared/types/doctor";

/** True when the current request carries a demo session cookie. */
export async function isDemoSession(): Promise<boolean> {
  const store = await cookies();
  return isDemoToken(store.get(AUTH_COOKIE_NAME)?.value);
}

/**
 * Server-side variant of /auth/me: forwards the httpOnly auth cookie as a
 * Bearer header. Returns null when unauthenticated or the API is unreachable.
 */
export async function getServerDoctor(): Promise<Doctor | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  if (isDemoToken(token)) {
    return DEMO_DOCTOR;
  }

  try {
    return await apiFetch<Doctor>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return null;
  }
}
