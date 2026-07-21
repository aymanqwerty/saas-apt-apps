"use client";

import { useState } from "react";

import { useClinics } from "@/features/clinics/hooks/useClinics";
import { useSlots, useUpdateSlot } from "@/features/slots/hooks/useSlots";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { Slot, SlotStatus } from "@/shared/types/slot";

const SELECT_CLASS =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3";

const STATUS_STYLES: Record<SlotStatus, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  FULL: "bg-amber-50 text-amber-700",
  BLOCKED: "bg-red-50 text-red-700",
  COMPLETED: "bg-blue-50 text-blue-700",
  EXPIRED: "bg-muted text-muted-foreground",
};

export function SlotManager() {
  const { data: clinics } = useClinics();
  // "" means "not yet chosen" → fall back to the first clinic once loaded.
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState<SlotStatus | "">("");
  const [page, setPage] = useState(1);

  const clinicId = selectedClinicId || clinics?.[0]?.id || "";

  const { data, isPending, isFetching, refetch } = useSlots({
    clinic_id: clinicId || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    status: status || undefined,
    page,
    limit: 20,
  });

  const hasRange = Boolean(dateFrom || dateTo || status);
  const resetToFirstPage = () => setPage(1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className={SELECT_CLASS}
          value={clinicId}
          onChange={(event) => {
            setSelectedClinicId(event.target.value);
            resetToFirstPage();
          }}
        >
          <option value="">Select a clinic</option>
          {clinics?.map((clinic) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.clinic_name}
            </option>
          ))}
        </select>
        <select
          className={SELECT_CLASS}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as SlotStatus | "");
            resetToFirstPage();
          }}
        >
          <option value="">All statuses</option>
          {Object.keys(STATUS_STYLES).map((s) => (
            <option key={s} value={s}>
              {s}
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
        {hasRange && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setStatus("");
              resetToFirstPage();
            }}
          >
            Clear
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {!clinicId ? (
        <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
          Select a clinic to view slots.
        </p>
      ) : isPending ? (
        <p className="text-muted-foreground text-sm">Loading slots...</p>
      ) : !data || data.items.length === 0 ? (
        <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
          No slots for this selection. Slots are generated from your availability
          rules.
        </p>
      ) : (
        <>
          <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-left text-xs tracking-wide uppercase">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Booked / Capacity</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((slot) => (
                    <SlotRow key={slot.id} slot={slot} />
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

function SlotRow({ slot }: { slot: Slot }) {
  const updateSlot = useUpdateSlot();
  const isBlocked = slot.is_manually_blocked;
  const canManage = slot.status !== "EXPIRED" && slot.status !== "COMPLETED";

  const toggleBlock = () => {
    updateSlot.mutate({
      slotId: slot.id,
      payload: { is_blocked: !isBlocked },
    });
  };

  const changeCapacity = () => {
    const input = window.prompt("New capacity", String(slot.capacity));
    if (!input) return;
    const capacity = Number(input);
    if (!Number.isInteger(capacity) || capacity < 1) return;
    updateSlot.mutate({ slotId: slot.id, payload: { capacity } });
  };

  return (
    <tr className="hover:bg-muted/40 border-t transition-colors">
      <td className="px-4 py-3">{slot.slot_date}</td>
      <td className="px-4 py-3">
        {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
      </td>
      <td className="px-4 py-3">
        {slot.booked_count} / {slot.capacity}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[slot.status]}`}
        >
          {slot.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          {canManage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleBlock}
                disabled={updateSlot.isPending}
              >
                {isBlocked ? "Unblock" : "Block"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={changeCapacity}
                disabled={updateSlot.isPending}
              >
                Capacity
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
