import { CircleCheck } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import type { BookingConfirmation } from "@/shared/types/booking";

export function BookingConfirmationCard({
  confirmation,
  onBookAnother,
}: {
  confirmation: BookingConfirmation;
  onBookAnother: () => void;
}) {
  const rows: [string, string][] = [
    ["Doctor", confirmation.doctor_name],
    ["Clinic", confirmation.clinic_name],
    ["Address", confirmation.clinic_address],
    ["Date", confirmation.appointment_date],
    [
      "Time",
      `${confirmation.start_time.slice(0, 5)}–${confirmation.end_time.slice(0, 5)}`,
    ],
  ];
  if (confirmation.consultation_fee) {
    rows.push(["Consultation fee", `₹${confirmation.consultation_fee}`]);
  }

  return (
    <div className="bg-card mx-auto flex max-w-md flex-col items-center gap-6 rounded-2xl border p-8 text-center shadow-sm">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CircleCheck className="size-9" />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Appointment Confirmed
        </h2>
        <p className="text-muted-foreground text-sm">
          Please save your appointment number and token.
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <div className="bg-primary/5 rounded-xl border p-3">
          <p className="text-muted-foreground text-xs">Appointment No.</p>
          <p className="mt-0.5 font-mono text-sm font-semibold">
            {confirmation.appointment_number}
          </p>
        </div>
        <div className="bg-primary/5 rounded-xl border p-3">
          <p className="text-muted-foreground text-xs">Token</p>
          <p className="text-primary mt-0.5 text-lg font-semibold">
            {confirmation.token_number}
          </p>
        </div>
      </div>

      <dl className="bg-muted/30 w-full divide-y rounded-xl border text-sm">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 px-4 py-2.5"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <Button variant="outline" onClick={onBookAnother} className="w-full">
        Book another appointment
      </Button>
    </div>
  );
}
