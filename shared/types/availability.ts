export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type RuleStatus = "ACTIVE" | "INACTIVE";

export interface AvailabilityRule {
  id: string;
  clinic_id: string;
  weekday: Weekday;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  patients_per_slot: number;
  buffer_minutes: number;
  effective_from: string;
  effective_until: string | null;
  status: RuleStatus;
  upcoming_booked_count: number;
}

export type ExceptionType = "HOLIDAY" | "LEAVE" | "CUSTOM" | "BLOCKED";

export interface AvailabilityException {
  id: string;
  clinic_id: string | null;
  exception_date: string;
  exception_type: ExceptionType;
  is_available: boolean;
  custom_start_time: string | null;
  custom_end_time: string | null;
  reason: string | null;
}
