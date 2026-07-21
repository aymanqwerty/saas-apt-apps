import type { Metadata } from "next";

import { PatientDetail } from "@/features/patients/components/PatientDetail";
import { BackLink } from "@/shared/components/BackLink";

export const metadata: Metadata = {
  title: "Patient | Doctor Management Platform",
};

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/dashboard/patients" label="Back to patients" />
      <PatientDetail patientId={patientId} />
    </div>
  );
}
