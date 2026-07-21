import { z } from "zod";

export const WEEKDAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

// Weekday selection is handled outside RHF (single on edit, multi on create).
export const ruleSchema = z
  .object({
    clinic_id: z.string().min(1, "Select a clinic"),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    slot_duration_minutes: z.number().int().min(1).max(480),
    patients_per_slot: z.number().int().min(1).max(100),
    buffer_minutes: z.number().int().min(0).max(240),
    effective_from: z.string().min(1, "Effective from is required"),
    effective_until: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export type RuleFormValues = z.infer<typeof ruleSchema>;
