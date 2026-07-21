export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export interface PatientListItem {
  id: string;
  patient_code: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  total_appointments: number;
  last_visit: string | null;
}

export interface PatientDetail {
  id: string;
  patient_code: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  age: number | null;
  gender: Gender | null;
  notes: string | null;
  total_appointments: number;
  last_visit: string | null;
  created_at: string;
}
