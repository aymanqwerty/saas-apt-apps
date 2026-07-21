import { apiFetch } from "@/shared/services/api/client";
import type {
  BookingConfirmation,
  BookingStartResponse,
  PublicDoctorProfile,
  PublicSettings,
  PublicSlot,
} from "@/shared/types/booking";

export interface BookingPayload {
  doctor_slug: string;
  slot_id: string;
  // Guest bookings supply these inline; logged-in patients omit them and pass
  // `account_member_id` for the saved profile (self or family member) instead.
  name?: string;
  phone_number?: string;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  account_member_id?: string | null;
  // Logged-in manual entry ("someone else"): optionally keep as a family member.
  save_as_member?: boolean;
  relationship?: string | null;
  reason?: string | null;
}

export interface ConfirmPaymentPayload {
  order_id: string;
  payment_id: string;
  signature: string;
}

export function getPublicDoctor(slug: string): Promise<PublicDoctorProfile> {
  return apiFetch<PublicDoctorProfile>(`/doctors/public/${slug}`);
}

export function listPublicSlots(
  slug: string,
  clinicId: string,
  slotDate: string,
): Promise<PublicSlot[]> {
  const params = new URLSearchParams({
    doctor_slug: slug,
    clinic_id: clinicId,
    slot_date: slotDate,
  });
  return apiFetch<PublicSlot[]>(`/public/slots?${params.toString()}`);
}

export function listAvailabilityDates(
  slug: string,
  clinicId: string,
  dateFrom: string,
  dateTo: string,
): Promise<string[]> {
  const params = new URLSearchParams({
    doctor_slug: slug,
    clinic_id: clinicId,
    date_from: dateFrom,
    date_to: dateTo,
  });
  return apiFetch<string[]>(`/public/availability-dates?${params.toString()}`);
}

export function getPublicSettings(slug: string): Promise<PublicSettings> {
  return apiFetch<PublicSettings>(`/doctors/public/${slug}/settings`);
}

/** Start a booking: returns an instant confirmation or a payment order to pay. */
export function startBooking(
  payload: BookingPayload,
): Promise<BookingStartResponse> {
  return apiFetch<BookingStartResponse>("/public/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Confirm a held booking after a successful gateway payment. */
export function confirmBooking(
  holdId: string,
  payload: ConfirmPaymentPayload,
): Promise<BookingConfirmation> {
  return apiFetch<BookingConfirmation>(`/public/bookings/${holdId}/confirm`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Release a held seat when the patient abandons checkout (best-effort). */
export function releaseBooking(holdId: string): Promise<null> {
  return apiFetch<null>(`/public/bookings/${holdId}/release`, {
    method: "POST",
  });
}
