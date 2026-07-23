"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { clearSessionCookie } from "@/features/authentication/actions/session";
import { logout } from "@/shared/services/api/auth.service";

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
      await clearSessionCookie();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
      router.refresh();
    },
  });
}
