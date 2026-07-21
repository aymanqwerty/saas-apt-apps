"use client";

import Link from "next/link";
import { useState } from "react";

import { usePatients } from "@/features/patients/hooks/usePatients";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";

export function PatientList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isPending, isError } = usePatients({
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  });

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search by name or phone..."
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        className="max-w-xs"
      />

      {isPending ? (
        <p className="text-muted-foreground text-sm">Loading patients...</p>
      ) : isError ? (
        <p className="text-destructive text-sm">Unable to load patients.</p>
      ) : data.items.length === 0 ? (
        <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
          No patients yet. Patient records are created when appointments are
          booked.
        </p>
      ) : (
        <>
          <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-left text-xs tracking-wide uppercase">
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Appointments</th>
                    <th className="px-4 py-3 font-medium">Last Visit</th>
                    <th className="px-4 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-muted/40 border-t transition-colors"
                    >
                      <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                        {patient.patient_code}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {patient.full_name}
                      </td>
                      <td className="px-4 py-3">{patient.phone_number}</td>
                      <td className="px-4 py-3">{patient.email ?? "—"}</td>
                      <td className="px-4 py-3">{patient.total_appointments}</td>
                      <td className="px-4 py-3">{patient.last_visit ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          render={
                            <Link href={`/dashboard/patients/${patient.id}`} />
                          }
                        >
                          View
                        </Button>
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
    </div>
  );
}
