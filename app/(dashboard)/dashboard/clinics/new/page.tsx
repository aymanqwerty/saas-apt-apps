import type { Metadata } from "next";

import { CreateClinic } from "@/features/clinics/components/CreateClinic";
import { BackLink } from "@/shared/components/BackLink";

export const metadata: Metadata = {
  title: "Add Clinic | Doctor Management Platform",
};

export default function NewClinicPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <BackLink href="/dashboard/clinics" label="Back to clinics" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Add Clinic</h1>
          <p className="text-muted-foreground text-sm">
            Create a new clinic location.
          </p>
        </div>
      </div>
      <CreateClinic />
    </div>
  );
}
