"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { setSessionCookie } from "@/features/authentication/actions/session";
import { login, type LoginPayload } from "@/shared/services/api/auth.service";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    // Persist the token in our own first-party cookie BEFORE navigating, so the
    // route guard and server components see the session on the next request.
    onSuccess: async (data) => {
      await setSessionCookie(data.token);
      router.push("/dashboard");
      router.refresh();
    },
  });
}
