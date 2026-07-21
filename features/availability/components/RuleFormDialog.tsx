"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  useCreateRulesBulk,
  useUpdateRule,
} from "@/features/availability/hooks/useAvailability";
import {
  ruleSchema,
  WEEKDAYS,
  type RuleFormValues,
} from "@/features/availability/validation/rule_schema";
import { useClinics } from "@/features/clinics/hooks/useClinics";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ApiError } from "@/shared/services/api/client";
import { cn } from "@/shared/lib/utils";
import type { AvailabilityRule, Weekday } from "@/shared/types/availability";

interface RuleFormDialogProps {
  rule?: AvailabilityRule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full appearance-none rounded-lg border bg-transparent pr-8 pl-2.5 text-sm outline-none focus-visible:ring-3",
          className,
        )}
        {...props}
      />
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2" />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

function toDefaults(rule?: AvailabilityRule): RuleFormValues {
  return {
    clinic_id: rule?.clinic_id ?? "",
    start_time: rule?.start_time?.slice(0, 5) ?? "09:00",
    end_time: rule?.end_time?.slice(0, 5) ?? "12:00",
    slot_duration_minutes: rule?.slot_duration_minutes ?? 30,
    patients_per_slot: rule?.patients_per_slot ?? 1,
    buffer_minutes: rule?.buffer_minutes ?? 0,
    effective_from: rule?.effective_from ?? new Date().toISOString().slice(0, 10),
    effective_until: rule?.effective_until ?? "",
    status: rule?.status ?? "ACTIVE",
  };
}

function dayLabel(day: Weekday): string {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

export function RuleFormDialog({ rule, open, onOpenChange }: RuleFormDialogProps) {
  const isEdit = Boolean(rule);
  const { data: clinics } = useClinics();
  const createMutation = useCreateRulesBulk();
  const updateMutation = useUpdateRule(rule?.id ?? "");
  const mutation = isEdit ? updateMutation : createMutation;

  // On create, several days can be selected; on edit it stays a single day.
  const [days, setDays] = useState<Weekday[]>(rule ? [rule.weekday] : []);
  const [daysError, setDaysError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    values: toDefaults(rule),
  });

  const toggleDay = (day: Weekday) => {
    setDaysError(null);
    setDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day],
    );
  };

  const onSubmit = (values: RuleFormValues) => {
    if (days.length === 0) {
      setDaysError("Select at least one day");
      return;
    }

    const shared = {
      clinic_id: values.clinic_id,
      start_time: `${values.start_time}:00`,
      end_time: `${values.end_time}:00`,
      slot_duration_minutes: values.slot_duration_minutes,
      patients_per_slot: values.patients_per_slot,
      buffer_minutes: values.buffer_minutes,
      effective_from: values.effective_from,
      effective_until: values.effective_until?.trim() || null,
      status: values.status,
    };

    if (isEdit) {
      updateMutation.mutate(
        { ...shared, weekday: days[0] },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(
        { ...shared, weekdays: days },
        {
          onSuccess: () => {
            setDays([]);
            onOpenChange(false);
          },
        },
      );
    }
  };

  const serverError =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
        ? "Unable to save the rule. Please try again."
        : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Availability Rule" : "Add Availability Rule"}
          </DialogTitle>
          <DialogDescription>
            Set a recurring weekly schedule. Booking slots are generated
            automatically from these hours.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="scrollbar-thin flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1"
          noValidate
        >
          <Field label="Clinic" htmlFor="clinic_id" error={errors.clinic_id?.message}>
            <NativeSelect id="clinic_id" {...register("clinic_id")}>
              <option value="">Select a clinic</option>
              {clinics?.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.clinic_name}
                </option>
              ))}
            </NativeSelect>
          </Field>

          {/* Weekday selection: multi on create, single on edit */}
          <Field
            label={isEdit ? "Day" : "Days"}
            error={daysError ?? undefined}
            hint={
              isEdit ? undefined : "One rule is created for each selected day."
            }
          >
            {isEdit ? (
              <NativeSelect
                value={days[0]}
                onChange={(event) => setDays([event.target.value as Weekday])}
              >
                {WEEKDAYS.map((day) => (
                  <option key={day} value={day}>
                    {dayLabel(day)}
                  </option>
                ))}
              </NativeSelect>
            ) : (
              <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAYS.map((day) => {
                  const active = days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "rounded-lg border py-2 text-xs font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground border-transparent"
                          : "hover:bg-muted",
                      )}
                    >
                      {dayLabel(day).slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start time" htmlFor="start_time">
              <Input id="start_time" type="time" {...register("start_time")} />
            </Field>
            <Field
              label="End time"
              htmlFor="end_time"
              error={errors.end_time?.message}
            >
              <Input id="end_time" type="time" {...register("end_time")} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Slot (min)" htmlFor="slot_duration_minutes">
              <Input
                id="slot_duration_minutes"
                type="number"
                min={1}
                {...register("slot_duration_minutes", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Per slot" htmlFor="patients_per_slot">
              <Input
                id="patients_per_slot"
                type="number"
                min={1}
                {...register("patients_per_slot", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Buffer (min)" htmlFor="buffer_minutes">
              <Input
                id="buffer_minutes"
                type="number"
                min={0}
                {...register("buffer_minutes", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Effective from" htmlFor="effective_from">
              <Input
                id="effective_from"
                type="date"
                {...register("effective_from")}
              />
            </Field>
            <Field label="Effective until" htmlFor="effective_until">
              <Input
                id="effective_until"
                type="date"
                {...register("effective_until")}
              />
            </Field>
          </div>

          <Field label="Status" htmlFor="status">
            <NativeSelect id="status" {...register("status")}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </NativeSelect>
          </Field>

          {serverError && (
            <p className="text-destructive text-sm" role="alert">
              {serverError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
