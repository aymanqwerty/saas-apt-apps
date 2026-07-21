export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface AppointmentListItem {
  id: string;
  appointment_number: string;
  token_number: number;
  appointment_status: AppointmentStatus;
  clinic_id: string;
  clinic_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  patient_name: string;
  patient_phone: string;
}

export interface AppointmentDetail {
  id: string;
  appointment_number: string;
  token_number: number;
  appointment_status: AppointmentStatus;
  booking_source: string;
  clinic_id: string;
  clinic_name: string;
  clinic_address: string;
  doctor_name: string;
  consultation_fee: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  visit_reason: string | null;
  doctor_notes: string | null;
  patient_notes: string | null;
  cancellation_reason: string | null;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  patient_age: number | null;
  created_at: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface Page<T> {
  items: T[];
  meta: PageMeta;
}
