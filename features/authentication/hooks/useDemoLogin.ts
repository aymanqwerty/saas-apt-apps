"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { DEMO_SESSION_TOKEN } from "@/shared/constants/demo";
import { setAuthCookie } from "@/shared/lib/auth-cookie";

/**
 * Start a demo session. No credentials and no API call: the sentinel token in
 * the auth cookie opens the dashboard with empty data everywhere.
 */
export function useDemoLogin() {
  const router = useRouter();

  return useCallback(() => {
    setAuthCookie(DEMO_SESSION_TOKEN);
    router.push("/dashboard");
    router.refresh();
  }, [router]);
}
