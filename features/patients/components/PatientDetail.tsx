"use client";

import Link from "next/link";

import {
  usePatient,
  usePatientAppointments,
} from "@/features/patients/hooks/usePatients";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/components/StatusBadge";

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

export function PatientDetail({ patientId }: { patientId: string }) {
  const { data: patient, isPending, isError } = usePatient(patientId);
  const { data: appointments } = usePatientAppointments(patientId);

  if (isPending) {
    return <p className="text-muted-foreground">Loading patient...</p>;
  }
  if (isError || !patient) {
    return <p className="text-destructive">Unable to load this patient.</p>;
  }

  const rows: [string, string][] = [
    ["Code", patient.patient_code],
    ["Phone", patient.phone_number],
    ["Email", patient.email ?? "—"],
    ["Age", patient.age !== null ? String(patient.age) : "—"],
    ["Gender", patient.gender ? GENDER_LABELS[patient.gender] : "—"],
    ["Total appointments", String(patient.total_appointments)],
    ["Last visit", patient.last_visit ?? "—"],
  ];

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{patient.full_name}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {patient.notes && (
            <div className="mt-4 text-sm">
              <p className="text-muted-foreground">Notes</p>
              <p className="font-medium">{patient.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
        </CardHeader>
        <CardContent>
          {!appointments ? (
            <p className="text-muted-foreground text-sm">Loading history...</p>
          ) : appointments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No appointments.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {appointments.map((appt) => (
                <li
                  key={appt.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{appt.appointment_date}</span>
                      <span className="text-muted-foreground">
                        {appt.start_time.slice(0, 5)}
                      </span>
                      <StatusBadge status={appt.appointment_status} />
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {appt.clinic_name} · {appt.appointment_number}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/dashboard/appointments/${appt.id}`} />}
                  >
                    View
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
