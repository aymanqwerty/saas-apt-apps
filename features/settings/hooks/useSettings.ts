"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSettings,
  updateSettings,
} from "@/shared/services/api/settings.service";
import type { DoctorSettings } from "@/shared/types/settings";

export const SETTINGS_QUERY_KEY = ["settings"] as const;

export function useSettings() {
  return useQuery({ queryKey: SETTINGS_QUERY_KEY, queryFn: getSettings });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<DoctorSettings>) => updateSettings(payload),
    meta: { successMessage: "Settings saved" },
    onSuccess: (settings) =>
      queryClient.setQueryData(SETTINGS_QUERY_KEY, settings),
  });
}
