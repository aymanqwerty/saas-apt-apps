"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { PROFILE_QUERY_KEY } from "@/features/doctor/hooks/useProfile";
import {
  updateProfile,
  type ProfileUpdatePayload,
} from "@/shared/services/api/doctor.service";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => updateProfile(payload),
    meta: { successMessage: "Profile updated" },
    onSuccess: (doctor) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, doctor);
      // Refresh server components (dashboard header shows the doctor name).
      router.refresh();
    },
  });
}
