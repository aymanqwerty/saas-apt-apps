"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAppointment,
  listAppointments,
  updateAppointment,
  type AppointmentFilters,
  type AppointmentUpdatePayload,
} from "@/shared/services/api/appointment.service";

export const APPOINTMENTS_QUERY_KEY = ["appointments"] as const;

export function useAppointments(filters: AppointmentFilters) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, filters],
    queryFn: () => listAppointments(filters),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, id],
    queryFn: () => getAppointment(id),
  });
}

export function useUpdateAppointment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AppointmentUpdatePayload) => updateAppointment(id, payload),
    meta: { successMessage: "Appointment updated" },
    onSuccess: (updated) => {
      queryClient.setQueryData([...APPOINTMENTS_QUERY_KEY, id], updated);
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      // Cancellation/reschedule change slot capacity.
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}
