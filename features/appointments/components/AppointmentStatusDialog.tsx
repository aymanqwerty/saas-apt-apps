"use client";

import { useState } from "react";

import { useUpdateAppointment } from "@/features/appointments/hooks/useAppointments";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { cn } from "@/shared/lib/utils";
import { ApiError } from "@/shared/services/api/client";
import type { AppointmentStatus } from "@/shared/types/appointment";

// Mirrors the backend ALLOWED_TRANSITIONS (appointment_service.py).
const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: ["COMPLETED"],
};

const ACTION_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirm",
  COMPLETED: "Mark completed",
  CANCELLED: "Cancel",
  NO_SHOW: "Mark no-show",
};

export function transitionsFor(status: AppointmentStatus): AppointmentStatus[] {
  return TRANSITIONS[status];
}

interface Props {
  appointment: { id: string; appointment_number: string; appointment_status: AppointmentStatus };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentStatusDialog({ appointment, open, onOpenChange }: Props) {
  const mutation = useUpdateAppointment(appointment.id);
  const targets = TRANSITIONS[appointment.appointment_status];
  const [target, setTarget] = useState<AppointmentStatus | null>(null);
  const [notes, setNotes] = useState("");

  const isCancel = target === "CANCELLED";

  const save = () => {
    if (!target) return;
    const trimmed = notes.trim();
    mutation.mutate(
      {
        status: target,
        ...(isCancel
          ? trimmed
            ? { cancellation_reason: trimmed }
            : {}
          : trimmed
            ? { doctor_notes: trimmed }
            : {}),
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const serverError = mutation.error instanceof ApiError ? mutation.error.message : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update appointment</DialogTitle>
          <DialogDescription>
            {appointment.appointment_number} · currently{" "}
            <StatusBadge status={appointment.appointment_status} />
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Change status to</Label>
            <div className="flex flex-wrap gap-2">
              {targets.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTarget(t)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                    target === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  {ACTION_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status_notes">
              {isCancel ? "Cancellation reason (optional)" : "Notes (optional)"}
            </Label>
            <textarea
              id="status_notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3"
              placeholder={
                isCancel ? "Why is this being cancelled?" : "Add a note for this visit"
              }
            />
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
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={!target || mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
