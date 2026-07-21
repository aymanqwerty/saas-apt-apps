"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  MY_APPOINTMENTS_KEY,
  MY_MEMBERS_KEY,
  PATIENT_ME_KEY,
} from "@/features/patient-account/hooks/usePatientAuth";
import {
  addMember,
  deleteMember,
  listMembers,
  listMyAppointments,
  updateMember,
  upsertProfile,
} from "@/shared/services/api/patient-account.service";
import type {
  MemberPayload,
  ProfilePayload,
} from "@/shared/types/patient-account";

export function useMyMembers(enabled = true) {
  return useQuery({
    queryKey: MY_MEMBERS_KEY,
    queryFn: listMembers,
    enabled,
  });
}

export function useMyAppointments(enabled = true) {
  return useQuery({
    queryKey: MY_APPOINTMENTS_KEY,
    queryFn: listMyAppointments,
    enabled,
  });
}

export function useUpsertProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfilePayload) => upsertProfile(payload),
    meta: { successMessage: "Profile saved" },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PATIENT_ME_KEY }),
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MemberPayload) => addMember(payload),
    meta: { successMessage: "Family member added" },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MY_MEMBERS_KEY }),
  });
}

export function useUpdateMember(memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<MemberPayload>) =>
      updateMember(memberId, payload),
    meta: { successMessage: "Family member updated" },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MY_MEMBERS_KEY }),
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => deleteMember(memberId),
    meta: { successMessage: "Family member removed" },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: MY_MEMBERS_KEY }),
  });
}
