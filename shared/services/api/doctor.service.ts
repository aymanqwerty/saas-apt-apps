import { apiFetch } from "@/shared/services/api/client";
import type { Doctor } from "@/shared/types/doctor";

export interface ProfileUpdatePayload {
  full_name?: string;
  email?: string;
  phone_number?: string;
  profile_photo?: string | null;
  qualification?: string | null;
  specialization?: string;
  experience_years?: number;
  registration_number?: string | null;
  about?: string | null;
  languages?: string[] | null;
}

export function getProfile(): Promise<Doctor> {
  return apiFetch<Doctor>("/doctors/profile");
}

export function updateProfile(payload: ProfileUpdatePayload): Promise<Doctor> {
  return apiFetch<Doctor>("/doctors/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
