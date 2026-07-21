import { apiFetch } from "@/shared/services/api/client";
import type { Clinic, ClinicStatus } from "@/shared/types/clinic";

export interface ClinicPayload {
  clinic_name: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  country?: string;
  postal_code?: string | null;
  google_maps_url?: string | null;
  phone_number?: string | null;
  consultation_fee?: string | null;
  description?: string | null;
  status?: ClinicStatus;
}

export interface ClinicFilters {
  search?: string;
  status?: ClinicStatus;
}

export function listClinics(filters: ClinicFilters = {}): Promise<Clinic[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return apiFetch<Clinic[]>(`/clinics${query ? `?${query}` : ""}`);
}

export function getClinic(clinicId: string): Promise<Clinic> {
  return apiFetch<Clinic>(`/clinics/${clinicId}`);
}

export function createClinic(payload: ClinicPayload): Promise<Clinic> {
  return apiFetch<Clinic>("/clinics", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateClinic(
  clinicId: string,
  payload: Partial<ClinicPayload>,
): Promise<Clinic> {
  return apiFetch<Clinic>(`/clinics/${clinicId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteClinic(clinicId: string): Promise<null> {
  return apiFetch<null>(`/clinics/${clinicId}`, { method: "DELETE" });
}
