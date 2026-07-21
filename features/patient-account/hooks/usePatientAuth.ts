"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getPatientMe,
  loginWithPassword,
  patientLogout,
  requestOtp,
  setPatientPassword,
  verifyOtp,
} from "@/shared/services/api/patient-account.service";

export const PATIENT_ME_KEY = ["patient-me"] as const;
export const MY_MEMBERS_KEY = ["my-members"] as const;
export const MY_APPOINTMENTS_KEY = ["my-appointments"] as const;

/** Current patient session, scoped to the given doctor's site. */
export function usePatientSession(slug: string) {
  return useQuery({
    queryKey: PATIENT_ME_KEY,
    queryFn: getPatientMe,
    staleTime: 60_000,
    // The cookie is per-browser; only treat it as a session for THIS doctor.
    select: (me) => (me && me.account.doctor_slug === slug ? me : null),
  });
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: ({ slug, phone }: { slug: string; phone: string }) =>
      requestOtp(slug, phone),
  });
}

function useSessionRefresh() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: PATIENT_ME_KEY });
    void queryClient.invalidateQueries({ queryKey: MY_MEMBERS_KEY });
    void queryClient.invalidateQueries({ queryKey: MY_APPOINTMENTS_KEY });
  };
}

export function useVerifyOtp() {
  const refresh = useSessionRefresh();
  return useMutation({
    mutationFn: ({
      slug,
      phone,
      code,
    }: {
      slug: string;
      phone: string;
      code: string;
    }) => verifyOtp(slug, phone, code),
    onSuccess: refresh,
  });
}

export function usePasswordLogin() {
  const refresh = useSessionRefresh();
  return useMutation({
    mutationFn: ({
      slug,
      phone,
      password,
    }: {
      slug: string;
      phone: string;
      password: string;
    }) => loginWithPassword(slug, phone, password),
    onSuccess: refresh,
  });
}

export function usePatientLogout() {
  const refresh = useSessionRefresh();
  return useMutation({
    mutationFn: () => patientLogout(),
    meta: { successMessage: "Signed out" },
    onSuccess: refresh,
  });
}

export function useSetPatientPassword() {
  return useMutation({
    mutationFn: (password: string) => setPatientPassword(password),
    meta: { successMessage: "Password updated" },
  });
}
