export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export type PatientRelationship =
  | "SELF"
  | "SPOUSE"
  | "FATHER"
  | "MOTHER"
  | "SON"
  | "DAUGHTER"
  | "BROTHER"
  | "SISTER"
  | "GUARDIAN"
  | "OTHER";

/** Relationships a patient can add as a family member (everything but SELF). */
export const MEMBER_RELATIONSHIPS: PatientRelationship[] = [
  "SPOUSE",
  "FATHER",
  "MOTHER",
  "SON",
  "DAUGHTER",
  "BROTHER",
  "SISTER",
  "GUARDIAN",
  "OTHER",
];

export interface PatientProfile {
  id: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  gender: Gender | null;
  date_of_birth: string | null;
  age: number | null;
  relationship: PatientRelationship | null;
}

export interface AccountSummary {
  id: string;
  doctor_slug: string;
  phone_number: string;
  is_verified: boolean;
  has_password: boolean;
  profile_complete: boolean;
}

export interface PatientAuthData {
  token: string;
  account: AccountSummary;
  profile: PatientProfile | null;
  is_new: boolean;
}

export interface MeResponse {
  account: AccountSummary;
  profile: PatientProfile | null;
}

export interface RequestOtpResponse {
  expires_in_seconds: number;
  debug_code: string | null;
}

export interface MyAppointment {
  id: string;
  appointment_number: string;
  token_number: number;
  appointment_status: string;
  patient_id: string;
  patient_name: string;
  doctor_name: string;
  clinic_name: string;
  clinic_address: string;
  consultation_fee: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
}

export interface ProfilePayload {
  full_name: string;
  email?: string | null;
  gender?: Gender | null;
  date_of_birth?: string | null;
  age?: number | null;
}

export interface MemberPayload {
  full_name: string;
  relationship: PatientRelationship;
  phone_number?: string | null;
  email?: string | null;
  gender?: Gender | null;
  date_of_birth?: string | null;
  age?: number | null;
}
