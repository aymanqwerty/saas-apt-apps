import { apiFetch } from "@/shared/services/api/client";
import type { DoctorSettings } from "@/shared/types/settings";

export function getSettings(): Promise<DoctorSettings> {
  return apiFetch<DoctorSettings>("/settings");
}

export function updateSettings(
  payload: Partial<DoctorSettings>,
): Promise<DoctorSettings> {
  return apiFetch<DoctorSettings>("/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
