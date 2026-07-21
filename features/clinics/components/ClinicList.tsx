"use client";

import Link from "next/link";
import { useState } from "react";

import { DeleteClinicDialog } from "@/features/clinics/components/DeleteClinicDialog";
import { useClinics } from "@/features/clinics/hooks/useClinics";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { Clinic, ClinicStatus } from "@/shared/types/clinic";

const STATUS_FILTERS: { label: string; value: ClinicStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export function ClinicList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ClinicStatus | "ALL">("ALL");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isPending, isError } = useClinics({
    search: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : status,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search clinics..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-1">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              variant={status === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {isPending ? (
        <p className="text-muted-foreground text-sm">Loading clinics...</p>
      ) : isError ? (
        <p className="text-destructive text-sm">Unable to load clinics.</p>
      ) : data.length === 0 ? (
        <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
          No clinics yet. Add your first clinic to start accepting bookings.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((clinic) => (
            <ClinicRow key={clinic.id} clinic={clinic} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ClinicRow({ clinic }: { clinic: Clinic }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <li className="bg-card flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{clinic.clinic_name}</span>
          <span
            className={
              clinic.status === "ACTIVE"
                ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                : "bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium"
            }
          >
            {clinic.status}
          </span>
        </div>
        <p className="text-muted-foreground truncate text-sm">
          {clinic.address_line_1}, {clinic.city}, {clinic.state}
        </p>
        {clinic.consultation_fee && (
          <p className="text-muted-foreground text-sm">
            Fee: ₹{clinic.consultation_fee}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/dashboard/clinics/${clinic.id}`} />}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </Button>
      </div>
      <DeleteClinicDialog
        clinic={clinic}
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
      />
    </li>
  );
}
