"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getPatient,
  getPatientAppointments,
  listPatients,
  type PatientFilters,
} from "@/shared/services/api/patient.service";

export const PATIENTS_QUERY_KEY = ["patients"] as const;

export function usePatients(filters: PatientFilters) {
  return useQuery({
    queryKey: [...PATIENTS_QUERY_KEY, filters],
    queryFn: () => listPatients(filters),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: [...PATIENTS_QUERY_KEY, id],
    queryFn: () => getPatient(id),
  });
}

export function usePatientAppointments(id: string) {
  return useQuery({
    queryKey: [...PATIENTS_QUERY_KEY, id, "appointments"],
    queryFn: () => getPatientAppointments(id),
  });
}
