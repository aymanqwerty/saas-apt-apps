import type { Metadata } from "next";

import { AppointmentList } from "@/features/appointments/components/AppointmentList";
import { PageHeader } from "@/shared/components/PageHeader";

export const metadata: Metadata = {
  title: "Appointments | Doctor Management Platform",
};

export default function AppointmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="View and manage patient appointments." />
      <AppointmentList />
    </div>
  );
}
