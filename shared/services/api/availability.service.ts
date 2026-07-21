import { apiFetch } from "@/shared/services/api/client";
import type {
  AvailabilityException,
  AvailabilityRule,
  ExceptionType,
  RuleStatus,
  Weekday,
} from "@/shared/types/availability";

export interface RulePayload {
  clinic_id: string;
  weekday: Weekday;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  patients_per_slot: number;
  buffer_minutes?: number;
  effective_from: string;
  effective_until?: string | null;
  status?: RuleStatus;
}

export interface ExceptionPayload {
  clinic_id?: string | null;
  exception_date: string;
  exception_type: ExceptionType;
  is_available: boolean;
  custom_start_time?: string | null;
  custom_end_time?: string | null;
  reason?: string | null;
}

export function listRules(): Promise<AvailabilityRule[]> {
  return apiFetch<AvailabilityRule[]>("/availability");
}

export function createRule(payload: RulePayload): Promise<AvailabilityRule> {
  return apiFetch<AvailabilityRule>("/availability", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface BulkRulePayload extends Omit<RulePayload, "weekday"> {
  weekdays: Weekday[];
}

export function createRulesBulk(
  payload: BulkRulePayload,
): Promise<AvailabilityRule[]> {
  return apiFetch<AvailabilityRule[]>("/availability/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRule(
  ruleId: string,
  payload: Partial<RulePayload>,
): Promise<AvailabilityRule> {
  return apiFetch<AvailabilityRule>(`/availability/${ruleId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteRule(ruleId: string): Promise<null> {
  return apiFetch<null>(`/availability/${ruleId}`, { method: "DELETE" });
}

export function listExceptions(): Promise<AvailabilityException[]> {
  return apiFetch<AvailabilityException[]>("/availability/exceptions");
}

export function createException(
  payload: ExceptionPayload,
): Promise<AvailabilityException> {
  return apiFetch<AvailabilityException>("/availability/exceptions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteException(exceptionId: string): Promise<null> {
  return apiFetch<null>(`/availability/exceptions/${exceptionId}`, {
    method: "DELETE",
  });
}
