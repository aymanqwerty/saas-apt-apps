"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { logout } from "@/shared/services/api/auth.service";
import { clearAuthCookie } from "@/shared/lib/auth-cookie";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Best-effort backend call; the JWT is stateless, so clearing our own
      // first-party cookie is what actually ends the session. Don't let a
      // cross-domain 401 block logout.
      try {
        await logout();
      } catch {
        /* ignore */
      }
      clearAuthCookie();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
  });
}
