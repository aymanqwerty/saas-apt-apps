"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createException,
  createRule,
  createRulesBulk,
  deleteException,
  deleteRule,
  listExceptions,
  listRules,
  updateRule,
  type BulkRulePayload,
  type ExceptionPayload,
  type RulePayload,
} from "@/shared/services/api/availability.service";

export const RULES_QUERY_KEY = ["availability", "rules"] as const;
export const EXCEPTIONS_QUERY_KEY = ["availability", "exceptions"] as const;
// Slot lists change whenever rules or exceptions change.
const SLOTS_ROOT_KEY = ["slots"] as const;

export function useRules() {
  return useQuery({ queryKey: RULES_QUERY_KEY, queryFn: listRules });
}

export function useExceptions() {
  return useQuery({ queryKey: EXCEPTIONS_QUERY_KEY, queryFn: listExceptions });
}

function useSchedulingInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: RULES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: EXCEPTIONS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: SLOTS_ROOT_KEY });
  };
}

export function useCreateRule() {
  const invalidate = useSchedulingInvalidation();
  return useMutation({
    mutationFn: (payload: RulePayload) => createRule(payload),
    meta: { successMessage: "Availability rule created" },
    onSuccess: invalidate,
  });
}

export function useCreateRulesBulk() {
  const invalidate = useSchedulingInvalidation();
  return useMutation({
    mutationFn: (payload: BulkRulePayload) => createRulesBulk(payload),
    meta: { successMessage: "Availability rules created" },
    onSuccess: invalidate,
  });
}

export function useUpdateRule(ruleId: string) {
  const invalidate = useSchedulingInvalidation();
  return useMutation({
    mutationFn: (payload: Partial<RulePayload>) => updateRule(ruleId, payload),
    meta: { successMessage: "Availability rule updated" },
    onSuccess: invalidate,
  });
}

export function useDeleteRule() {
  const invalidate = useSchedulingInvalidation();
  return useMutation({
    mutationFn: (ruleId: string) => deleteRule(ruleId),
    meta: { successMessage: "Availability rule deleted" },
    onSuccess: invalidate,
  });
}

export function useCreateException() {
  const invalidate = useSchedulingInvalidation();
  return useMutation({
    mutationFn: (payload: ExceptionPayload) => createException(payload),
    meta: { successMessage: "Exception created" },
    onSuccess: invalidate,
  });
}

export function useDeleteException() {
  const invalidate = useSchedulingInvalidation();
  return useMutation({
    mutationFn: (exceptionId: string) => deleteException(exceptionId),
    meta: { successMessage: "Exception deleted" },
    onSuccess: invalidate,
  });
}
