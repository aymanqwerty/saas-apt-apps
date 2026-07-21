"use client";

import { useState } from "react";

import { RescheduleDialog } from "@/features/appointments/components/RescheduleDialog";
import {
  useAppointment,
  useUpdateAppointment,
} from "@/features/appointments/hooks/useAppointments";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { ApiError } from "@/shared/services/api/client";
import type {
  AppointmentDetail as Appointment,
  AppointmentStatus,
} from "@/shared/types/appointment";

// Mirrors the backend transition map (docs/03 §10).
const NEXT_STATUSES: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: ["COMPLETED"],
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Mark Pending",
  CONFIRMED: "Confirm",
  COMPLETED: "Mark Completed",
  CANCELLED: "Cancel",
  NO_SHOW: "Mark No-show",
};

export function AppointmentDetail({ appointmentId }: { appointmentId: string }) {
  const { data, isPending, isError } = useAppointment(appointmentId);

  if (isPending) {
    return <p className="text-muted-foreground">Loading appointment...</p>;
  }
  if (isError || !data) {
    return <p className="text-destructive">Unable to load this appointment.</p>;
  }
  return <AppointmentDetailInner appointment={data} />;
}

function AppointmentDetailInner({ appointment }: { appointment: Appointment }) {
  const updateMutation = useUpdateAppointment(appointment.id);
  const [notes, setNotes] = useState(appointment.doctor_notes ?? "");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const canModify =
    appointment.appointment_status !== "CANCELLED" &&
    appointment.appointment_status !== "COMPLETED";
  const canReschedule =
    appointment.appointment_status === "PENDING" ||
    appointment.appointment_status === "CONFIRMED";

  const infoRows: [string, string][] = [
    ["Token", String(appointment.token_number)],
    ["Clinic", appointment.clinic_name],
    ["Address", appointment.clinic_address],
    ["Date", appointment.appointment_date],
    [
      "Time",
      `${appointment.start_time.slice(0, 5)}–${appointment.end_time.slice(0, 5)}`,
    ],
    ["Source", appointment.booking_source],
  ];
  if (appointment.consultation_fee) {
    infoRows.push(["Fee", `₹${appointment.consultation_fee}`]);
  }
  if (appointment.visit_reason) {
    infoRows.push(["Visit reason", appointment.visit_reason]);
  }
  if (appointment.cancellation_reason) {
    infoRows.push(["Cancellation reason", appointment.cancellation_reason]);
  }

  const patientRows: [string, string][] = [
    ["Name", appointment.patient_name],
    ["Phone", appointment.patient_phone],
  ];
  if (appointment.patient_email) patientRows.push(["Email", appointment.patient_email]);
  if (appointment.patient_age !== null)
    patientRows.push(["Age", String(appointment.patient_age)]);

  const serverError =
    updateMutation.error instanceof ApiError ? updateMutation.error.message : null;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm">{appointment.appointment_number}</span>
        <StatusBadge status={appointment.appointment_status} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-2 text-sm">
              {infoRows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-2 text-sm">
              {patientRows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      {canModify && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {NEXT_STATUSES[appointment.appointment_status].map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate({ status })}
              >
                {STATUS_LABELS[status]}
              </Button>
            ))}
            {canReschedule && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRescheduleOpen(true)}
              >
                Reschedule
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setCancelOpen(true)}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Doctor Notes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:ring-3"
          />
          <div>
            <Button
              size="sm"
              disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate({ doctor_notes: notes })}
            >
              Save notes
            </Button>
          </div>
        </CardContent>
      </Card>

      {serverError && (
        <p className="text-destructive text-sm" role="alert">
          {serverError}
        </p>
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel appointment</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cancel_reason">Reason (optional)</Label>
              <Input
                id="cancel_reason"
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCancelOpen(false)}>
                Keep
              </Button>
              <Button
                variant="destructive"
                disabled={updateMutation.isPending}
                onClick={() =>
                  updateMutation.mutate(
                    {
                      status: "CANCELLED",
                      cancellation_reason: cancelReason || undefined,
                    },
                    { onSuccess: () => setCancelOpen(false) },
                  )
                }
              >
                Cancel appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RescheduleDialog
        appointmentId={appointment.id}
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
      />
    </div>
  );
}
