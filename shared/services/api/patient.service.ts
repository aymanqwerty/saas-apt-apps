import { apiFetch } from "@/shared/services/api/client";
import type { AppointmentListItem, Page } from "@/shared/types/appointment";
import type { PatientDetail, PatientListItem } from "@/shared/types/patient";

export interface PatientFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export function listPatients(
  filters: PatientFilters = {},
): Promise<Page<PatientListItem>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return apiFetch<Page<PatientListItem>>(`/patients${query ? `?${query}` : ""}`);
}

export function getPatient(id: string): Promise<PatientDetail> {
  return apiFetch<PatientDetail>(`/patients/${id}`);
}

export function getPatientAppointments(
  id: string,
): Promise<AppointmentListItem[]> {
  return apiFetch<AppointmentListItem[]>(`/patients/${id}/appointments`);
}
