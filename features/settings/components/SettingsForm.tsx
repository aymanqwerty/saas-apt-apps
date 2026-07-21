"use client";

import {
  useSettings,
  useUpdateSettings,
} from "@/features/settings/hooks/useSettings";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { DoctorSettings } from "@/shared/types/settings";

const TOGGLES: { key: keyof DoctorSettings; label: string; help: string }[] = [
  {
    key: "booking_enabled",
    label: "Enable Appointment Booking",
    help: "Allow patients to book appointments from your public website.",
  },
  {
    key: "gallery_enabled",
    label: "Enable Gallery",
    help: "Show your published gallery posts publicly.",
  },
  {
    key: "show_consultation_fee",
    label: "Show Consultation Fee",
    help: "Display clinic consultation fees on your public website.",
  },
  {
    key: "show_contact_information",
    label: "Show Contact Information",
    help: "Display clinic phone numbers on your public website.",
  },
  {
    key: "payment_required",
    label: "Require Advance Payment",
    help: "Patients must pay the clinic's consultation fee online before an appointment is confirmed. Clinics with no fee set stay free.",
  },
];

export function SettingsForm() {
  const { data, isPending, isError } = useSettings();
  const updateMutation = useUpdateSettings();

  if (isPending) {
    return <p className="text-muted-foreground">Loading settings...</p>;
  }
  if (isError || !data) {
    return <p className="text-destructive">Unable to load settings.</p>;
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="flex flex-col divide-y">
        {TOGGLES.map((toggle) => (
          <label
            key={toggle.key}
            className="flex cursor-pointer items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
          >
            <span className="flex flex-col">
              <span className="font-medium">{toggle.label}</span>
              <span className="text-muted-foreground text-sm">{toggle.help}</span>
            </span>
            <input
              type="checkbox"
              className="size-5 shrink-0 accent-blue-600"
              checked={data[toggle.key]}
              disabled={updateMutation.isPending}
              onChange={(event) =>
                updateMutation.mutate({ [toggle.key]: event.target.checked })
              }
            />
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
