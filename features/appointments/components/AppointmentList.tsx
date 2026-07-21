"use client";

import Link from "next/link";
import { useState } from "react";

import {
  AppointmentStatusDialog,
  transitionsFor,
} from "@/features/appointments/components/AppointmentStatusDialog";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { useClinics } from "@/features/clinics/hooks/useClinics";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type {
  AppointmentListItem,
  AppointmentStatus,
} from "@/shared/types/appointment";

const SELECT_CLASS =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3";

const STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export function AppointmentList() {
  const { data: clinics } = useClinics();
  const [status, setStatus] = useState<AppointmentStatus | "">("");
  const [clinicId, setClinicId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [patient, setPatient] = useState("");
  const [page, setPage] = useState(1);
  const [statusAppt, setStatusAppt] = useState<AppointmentListItem | null>(null);
  const debouncedPatient = useDebounce(patient, 300);

  const { data, isPending, isError } = useAppointments({
    status: status || undefined,
    clinic_id: clinicId || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    patient_name: debouncedPatient || undefined,
    page,
    limit: 20,
  });

  const resetToFirstPage = () => setPage(1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search patient..."
          value={patient}
          onChange={(event) => {
            setPatient(event.target.value);
            resetToFirstPage();
          }}
          className="max-w-xs"
        />
        <select
          className={SELECT_CLASS}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as AppointmentStatus | "");
            resetToFirstPage();
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className={SELECT_CLASS}
          value={clinicId}
          onChange={(event) => {
            setClinicId(event.target.value);
            resetToFirstPage();
          }}
        >
          <option value="">All clinics</option>
          {clinics?.map((clinic) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.clinic_name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">From</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              resetToFirstPage();
            }}
            className="max-w-[10rem]"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(event) => {
              setDateTo(event.target.value);
              resetToFirstPage();
            }}
            className="max-w-[10rem]"
          />
        </div>
      </div>

      {isPending ? (
        <p className="text-muted-foreground text-sm">Loading appointments...</p>
      ) : isError ? (
        <p className="text-destructive text-sm">Unable to load appointments.</p>
      ) : data.items.length === 0 ? (
        <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
          No appointments match your filters.
        </p>
      ) : (
        <>
          <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-left text-xs tracking-wide uppercase">
                    <th className="px-4 py-3 font-medium">Ref</th>
                    <th className="px-4 py-3 font-medium">Token</th>
                    <th className="px-4 py-3 font-medium">Patient</th>
                    <th className="px-4 py-3 font-medium">Clinic</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((appt) => (
                    <tr
                      key={appt.id}
                      className="hover:bg-muted/40 border-t transition-colors"
                    >
                      <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                        {appt.appointment_number}
                      </td>
                      <td className="px-4 py-3">{appt.token_number}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{appt.patient_name}</div>
                        <div className="text-muted-foreground text-xs">
                          {appt.patient_phone}
                        </div>
                      </td>
                      <td className="px-4 py-3">{appt.clinic_name}</td>
                      <td className="px-4 py-3">{appt.appointment_date}</td>
                      <td className="px-4 py-3">{appt.start_time.slice(0, 5)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={appt.appointment_status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {transitionsFor(appt.appointment_status).length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setStatusAppt(appt)}
                            >
                              Update status
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            render={
                              <Link href={`/dashboard/appointments/${appt.id}`} />
                            }
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {data.meta.total} total · page {data.meta.page} of{" "}
              {Math.max(data.meta.total_pages, 1)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.meta.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {statusAppt && (
        <AppointmentStatusDialog
          appointment={statusAppt}
          open={statusAppt !== null}
          onOpenChange={(open) => {
            if (!open) setStatusAppt(null);
          }}
        />
      )}
    </div>
  );
}
