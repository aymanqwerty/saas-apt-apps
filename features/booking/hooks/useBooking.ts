"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  confirmBooking,
  getPublicDoctor,
  getPublicSettings,
  listAvailabilityDates,
  listPublicSlots,
  startBooking,
  type BookingPayload,
  type ConfirmPaymentPayload,
} from "@/shared/services/api/public.service";

export function usePublicDoctor(slug: string) {
  return useQuery({
    queryKey: ["public-doctor", slug],
    queryFn: () => getPublicDoctor(slug),
  });
}

export function usePublicSettings(slug: string) {
  return useQuery({
    queryKey: ["public-settings", slug],
    queryFn: () => getPublicSettings(slug),
  });
}

export function usePublicSlots(
  slug: string,
  clinicId: string | null,
  slotDate: string | null,
) {
  return useQuery({
    queryKey: ["public-slots", slug, clinicId, slotDate],
    queryFn: () => listPublicSlots(slug, clinicId as string, slotDate as string),
    enabled: Boolean(clinicId && slotDate),
  });
}

export function useAvailabilityDates(
  slug: string,
  clinicId: string | null,
  dateFrom: string | null,
  dateTo: string | null,
) {
  return useQuery({
    queryKey: ["availability-dates", slug, clinicId, dateFrom, dateTo],
    queryFn: () =>
      listAvailabilityDates(
        slug,
        clinicId as string,
        dateFrom as string,
        dateTo as string,
      ),
    enabled: Boolean(clinicId && dateFrom && dateTo),
  });
}

export function useStartBooking() {
  return useMutation({
    mutationFn: (payload: BookingPayload) => startBooking(payload),
  });
}

export function useConfirmBooking() {
  return useMutation({
    mutationFn: ({
      holdId,
      payload,
    }: {
      holdId: string;
      payload: ConfirmPaymentPayload;
    }) => confirmBooking(holdId, payload),
  });
}
