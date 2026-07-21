"use client";

import { useState } from "react";

import { useUpdateAppointment } from "@/features/appointments/hooks/useAppointments";
import { useClinics } from "@/features/clinics/hooks/useClinics";
import { useSlots } from "@/features/slots/hooks/useSlots";
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

const SELECT_CLASS =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3";

export function RescheduleDialog({
  appointmentId,
  open,
  onOpenChange,
}: {
  appointmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: clinics } = useClinics();
  const [clinicId, setClinicId] = useState("");
  const [date, setDate] = useState("");
  const updateMutation = useUpdateAppointment(appointmentId);

  const { data: slotPage, isFetching } = useSlots({
    clinic_id: clinicId || undefined,
    slot_date: date || undefined,
    status: "AVAILABLE",
    limit: 100,
  });
  const slots = slotPage?.items ?? [];

  const reschedule = (slotId: string) => {
    updateMutation.mutate(
      { reschedule_slot_id: slotId },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const serverError =
    updateMutation.error instanceof ApiError ? updateMutation.error.message : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reschedule_clinic">Clinic</Label>
            <select
              id="reschedule_clinic"
              className={SELECT_CLASS}
              value={clinicId}
              onChange={(event) => setClinicId(event.target.value)}
            >
              <option value="">Select a clinic</option>
              {clinics?.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.clinic_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reschedule_date">Date</Label>
            <Input
              id="reschedule_date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          {clinicId && date && (
            <div className="flex flex-col gap-2">
              <Label>Available times</Label>
              {isFetching ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : !slots || slots.length === 0 ? (
                <p className="text-muted-foreground text-sm">No available slots.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant="outline"
                      size="sm"
                      disabled={updateMutation.isPending}
                      onClick={() => reschedule(slot.id)}
                    >
                      {slot.start_time.slice(0, 5)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {serverError && (
            <p className="text-destructive text-sm" role="alert">
              {serverError}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
