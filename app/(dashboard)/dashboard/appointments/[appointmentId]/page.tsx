import type { Metadata } from "next";

import { AppointmentDetail } from "@/features/appointments/components/AppointmentDetail";
import { BackLink } from "@/shared/components/BackLink";

export const metadata: Metadata = {
  title: "Appointment | Doctor Management Platform",
};

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <BackLink href="/dashboard/appointments" label="Back to appointments" />
        <h1 className="text-xl font-semibold tracking-tight">
          Appointment Details
        </h1>
      </div>
      <AppointmentDetail appointmentId={appointmentId} />
    </div>
  );
}
