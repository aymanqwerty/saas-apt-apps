"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createClinic,
  deleteClinic,
  getClinic,
  listClinics,
  updateClinic,
  type ClinicFilters,
  type ClinicPayload,
} from "@/shared/services/api/clinic.service";

export const CLINICS_QUERY_KEY = ["clinics"] as const;

export function useClinics(filters: ClinicFilters = {}) {
  return useQuery({
    queryKey: [...CLINICS_QUERY_KEY, filters],
    queryFn: () => listClinics(filters),
  });
}

export function useClinic(clinicId: string) {
  return useQuery({
    queryKey: [...CLINICS_QUERY_KEY, clinicId],
    queryFn: () => getClinic(clinicId),
  });
}

export function useCreateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClinicPayload) => createClinic(payload),
    meta: { successMessage: "Clinic created" },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CLINICS_QUERY_KEY }),
  });
}

export function useUpdateClinic(clinicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ClinicPayload>) =>
      updateClinic(clinicId, payload),
    meta: { successMessage: "Clinic updated" },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CLINICS_QUERY_KEY }),
  });
}

export function useDeleteClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clinicId: string) => deleteClinic(clinicId),
    meta: { successMessage: "Clinic deleted" },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CLINICS_QUERY_KEY }),
  });
}
