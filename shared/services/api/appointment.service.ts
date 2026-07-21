import { apiFetch } from "@/shared/services/api/client";
import type {
  AppointmentDetail,
  AppointmentListItem,
  AppointmentStatus,
  Page,
} from "@/shared/types/appointment";

export interface AppointmentFilters {
  status?: AppointmentStatus;
  clinic_id?: string;
  appointment_date?: string;
  date_from?: string;
  date_to?: string;
  patient_name?: string;
  appointment_number?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentUpdatePayload {
  status?: AppointmentStatus;
  doctor_notes?: string;
  cancellation_reason?: string;
  reschedule_slot_id?: string;
}

export function listAppointments(
  filters: AppointmentFilters = {},
): Promise<Page<AppointmentListItem>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return apiFetch<Page<AppointmentListItem>>(
    `/appointments${query ? `?${query}` : ""}`,
  );
}

export function getAppointment(id: string): Promise<AppointmentDetail> {
  return apiFetch<AppointmentDetail>(`/appointments/${id}`);
}

export function updateAppointment(
  id: string,
  payload: AppointmentUpdatePayload,
): Promise<AppointmentDetail> {
  return apiFetch<AppointmentDetail>(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
