"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { useCreateException } from "@/features/availability/hooks/useAvailability";
import { useClinics } from "@/features/clinics/hooks/useClinics";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ApiError } from "@/shared/services/api/client";
import type { ExceptionPayload } from "@/shared/services/api/availability.service";

const SELECT_CLASS =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3";

const exceptionSchema = z
  .object({
    clinic_id: z.string(),
    exception_date: z.string().min(1, "Date is required"),
    exception_type: z.enum(["HOLIDAY", "LEAVE", "CUSTOM", "BLOCKED"]),
    is_available: z.enum(["false", "true"]),
    custom_start_time: z.string().optional(),
    custom_end_time: z.string().optional(),
    reason: z.string().max(500).optional(),
  })
  .refine(
    (data) =>
      data.is_available === "false" ||
      (data.custom_start_time && data.custom_end_time),
    {
      message: "Custom times are required when the doctor is available",
      path: ["custom_start_time"],
    },
  );

type ExceptionFormValues = z.infer<typeof exceptionSchema>;

export function ExceptionFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: clinics } = useClinics();
  const createMutation = useCreateException();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ExceptionFormValues>({
    resolver: zodResolver(exceptionSchema),
    defaultValues: {
      clinic_id: "",
      exception_date: new Date().toISOString().slice(0, 10),
      exception_type: "HOLIDAY",
      is_available: "false",
      custom_start_time: "",
      custom_end_time: "",
      reason: "",
    },
  });

  const isAvailable =
    useWatch({ control, name: "is_available" }) === "true";

  const onSubmit = (values: ExceptionFormValues) => {
    const payload: ExceptionPayload = {
      clinic_id: values.clinic_id || null,
      exception_date: values.exception_date,
      exception_type: values.exception_type,
      is_available: values.is_available === "true",
      custom_start_time:
        values.is_available === "true" && values.custom_start_time
          ? `${values.custom_start_time}:00`
          : null,
      custom_end_time:
        values.is_available === "true" && values.custom_end_time
          ? `${values.custom_end_time}:00`
          : null,
      reason: values.reason?.trim() || null,
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  const serverError =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.isError
        ? "Unable to save the exception. Please try again."
        : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Exception</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clinic_id">Clinic</Label>
            <select id="clinic_id" className={SELECT_CLASS} {...register("clinic_id")}>
              <option value="">All clinics</option>
              {clinics?.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.clinic_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exception_date">Date</Label>
              <Input id="exception_date" type="date" {...register("exception_date")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exception_type">Type</Label>
              <select
                id="exception_type"
                className={SELECT_CLASS}
                {...register("exception_type")}
              >
                <option value="HOLIDAY">Holiday</option>
                <option value="LEAVE">Leave</option>
                <option value="CUSTOM">Custom hours</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="is_available">Availability</Label>
            <select
              id="is_available"
              className={SELECT_CLASS}
              {...register("is_available")}
            >
              <option value="false">Unavailable (day off)</option>
              <option value="true">Available with custom hours</option>
            </select>
          </div>

          {isAvailable && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="custom_start_time">Custom Start</Label>
                <Input
                  id="custom_start_time"
                  type="time"
                  {...register("custom_start_time")}
                />
                {errors.custom_start_time && (
                  <p className="text-destructive text-sm">
                    {errors.custom_start_time.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="custom_end_time">Custom End</Label>
                <Input
                  id="custom_end_time"
                  type="time"
                  {...register("custom_end_time")}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input id="reason" {...register("reason")} />
          </div>

          {serverError && (
            <p className="text-destructive text-sm" role="alert">
              {serverError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
