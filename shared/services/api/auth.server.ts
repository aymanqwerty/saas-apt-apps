import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/shared/constants/auth";
import { apiFetch } from "@/shared/services/api/client";
import type { Doctor } from "@/shared/types/doctor";

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

  try {
    return await apiFetch<Doctor>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return null;
  }
}
