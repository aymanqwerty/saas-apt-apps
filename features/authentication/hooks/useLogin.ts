"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { login, type LoginPayload } from "@/shared/services/api/auth.service";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: () => {
      router.push("/dashboard");
      router.refresh();
    },
  });
}
