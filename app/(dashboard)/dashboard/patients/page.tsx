import type { Metadata } from "next";

import { PatientList } from "@/features/patients/components/PatientList";
import { PageHeader } from "@/shared/components/PageHeader";

export const metadata: Metadata = {
  title: "Patients | Doctor Management Platform",
};

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Patient records and appointment history." />
      <PatientList />
    </div>
  );
}
