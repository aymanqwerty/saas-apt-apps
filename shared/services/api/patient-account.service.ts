import { ApiError, apiFetch } from "@/shared/services/api/client";
import type {
  MeResponse,
  MemberPayload,
  MyAppointment,
  PatientAuthData,
  PatientProfile,
  ProfilePayload,
  RequestOtpResponse,
} from "@/shared/types/patient-account";

// ---------------------------------------------------------------- auth

export function requestOtp(
  doctorSlug: string,
  phoneNumber: string,
): Promise<RequestOtpResponse> {
  return apiFetch<RequestOtpResponse>("/patient-auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ doctor_slug: doctorSlug, phone_number: phoneNumber }),
  });
}

export function verifyOtp(
  doctorSlug: string,
  phoneNumber: string,
  code: string,
): Promise<PatientAuthData> {
  return apiFetch<PatientAuthData>("/patient-auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      doctor_slug: doctorSlug,
      phone_number: phoneNumber,
      code,
    }),
  });
}

export function loginWithPassword(
  doctorSlug: string,
  phoneNumber: string,
  password: string,
): Promise<PatientAuthData> {
  return apiFetch<PatientAuthData>("/patient-auth/login", {
    method: "POST",
    body: JSON.stringify({
      doctor_slug: doctorSlug,
      phone_number: phoneNumber,
      password,
    }),
  });
}

/** Current patient session, or null when not signed in (401). */
export async function getPatientMe(): Promise<MeResponse | null> {
  try {
    return await apiFetch<MeResponse>("/patient-auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function setPatientPassword(password: string): Promise<null> {
  return apiFetch<null>("/patient-auth/set-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function patientLogout(): Promise<null> {
  return apiFetch<null>("/patient-auth/logout", { method: "POST" });
}

// ------------------------------------------------------------- account

export function getProfile(): Promise<PatientProfile | null> {
  return apiFetch<PatientProfile | null>("/patient-account/profile");
}

export function upsertProfile(payload: ProfilePayload): Promise<PatientProfile> {
  return apiFetch<PatientProfile>("/patient-account/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function listMembers(): Promise<PatientProfile[]> {
  return apiFetch<PatientProfile[]>("/patient-account/members");
}

export function addMember(payload: MemberPayload): Promise<PatientProfile> {
  return apiFetch<PatientProfile>("/patient-account/members", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMember(
  memberId: string,
  payload: Partial<MemberPayload>,
): Promise<PatientProfile> {
  return apiFetch<PatientProfile>(`/patient-account/members/${memberId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteMember(memberId: string): Promise<null> {
  return apiFetch<null>(`/patient-account/members/${memberId}`, {
    method: "DELETE",
  });
}

export function listMyAppointments(): Promise<MyAppointment[]> {
  return apiFetch<MyAppointment[]>("/patient-account/appointments");
}
