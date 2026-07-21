import type { Metadata } from "next";

import { EditClinic } from "@/features/clinics/components/EditClinic";
import { BackLink } from "@/shared/components/BackLink";

export const metadata: Metadata = {
  title: "Edit Clinic | Doctor Management Platform",
};

export default async function EditClinicPage({
  params,
}: {
  params: Promise<{ clinicId: string }>;
}) {
  const { clinicId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <BackLink href="/dashboard/clinics" label="Back to clinics" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Edit Clinic</h1>
          <p className="text-muted-foreground text-sm">Update clinic details.</p>
        </div>
      </div>
      <EditClinic clinicId={clinicId} />
    </div>
  );
}
