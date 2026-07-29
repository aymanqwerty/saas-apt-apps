"use client";

import { useState } from "react";

import {
  useSettings,
  useUpdateSettings,
} from "@/features/settings/hooks/useSettings";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { DoctorSettings } from "@/shared/types/settings";

const DEFAULT_SECTION_LABEL = "Success Stories";

type ToggleKey = Exclude<keyof DoctorSettings, "section_label">;

const TOGGLES: { key: ToggleKey; label: string; help: string }[] = [
  {
    key: "booking_enabled",
    label: "Enable Appointment Booking",
    help: "Allow patients to book appointments from your public website.",
  },
  {
    key: "gallery_enabled",
    label: "Enable Blog Section",
    help: "Show your published blog posts publicly.",
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
  // `null` means untouched, so the field simply mirrors the server value.
  // Deriving it this way avoids syncing state in an effect, which would
  // trigger cascading renders (and is banned by our lint rules).
  const [draftLabel, setDraftLabel] = useState<string | null>(null);
  const label = draftLabel ?? data?.section_label ?? "";

  if (isPending) {
    return <p className="text-muted-foreground">Loading settings...</p>;
  }
  if (isError || !data) {
    return <p className="text-destructive">Unable to load settings.</p>;
  }

  const labelChanged = label.trim() !== (data.section_label ?? "").trim();

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col divide-y">
          {TOGGLES.map((toggle) => (
            <label
              key={toggle.key}
              className="flex cursor-pointer items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <span className="flex flex-col">
                <span className="font-medium">{toggle.label}</span>
                <span className="text-muted-foreground text-sm">
                  {toggle.help}
                </span>
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

      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="section_label">Blog Section Name</Label>
            <p className="text-muted-foreground text-sm">
              What this section is called on your public website — for example
              “Success Stories”, “Achievements”, “Operations” or “Blog”. The web
              address stays the same, so renaming never breaks links you have
              already shared.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              id="section_label"
              value={label}
              maxLength={50}
              placeholder={DEFAULT_SECTION_LABEL}
              onChange={(event) => setDraftLabel(event.target.value)}
            />
            <Button
              type="button"
              disabled={updateMutation.isPending || !labelChanged}
              onClick={() =>
                updateMutation.mutate(
                  { section_label: label.trim() },
                  // Drop the draft so the field tracks the server again.
                  { onSuccess: () => setDraftLabel(null) },
                )
              }
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Leave empty to use “{DEFAULT_SECTION_LABEL}”.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
