"use client";

import { useState } from "react";

import { useClinics } from "@/features/clinics/hooks/useClinics";
import { usePayments } from "@/features/payments/hooks/usePayments";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { PaymentStatus } from "@/shared/types/payment";

const SELECT_CLASS =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3";

const STATUSES: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "REFUNDED"];

const STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
  REFUNDED: "bg-blue-50 text-blue-700",
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function formatAmount(amount: string, currency: string): string {
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${amount}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PaymentList() {
  const { data: clinics } = useClinics();
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [clinicId, setClinicId] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isPending, isError, refetch, isFetching } = usePayments({
    status: status || undefined,
    clinic_id: clinicId || undefined,
    search: debouncedSearch || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page,
    limit: 20,
  });

  const resetToFirstPage = () => setPage(1);
  const hasDateFilter = Boolean(dateFrom || dateTo);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search patient..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            resetToFirstPage();
          }}
          className="max-w-xs"
        />
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
        <select
          className={SELECT_CLASS}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as PaymentStatus | "");
            resetToFirstPage();
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-sm">From</span>
          <input
            type="date"
            className={SELECT_CLASS}
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(event) => {
              setDateFrom(event.target.value);
              resetToFirstPage();
            }}
          />
          <span className="text-muted-foreground text-sm">To</span>
          <input
            type="date"
            className={SELECT_CLASS}
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(event) => {
              setDateTo(event.target.value);
              resetToFirstPage();
            }}
          />
        </div>
        {hasDateFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              resetToFirstPage();
            }}
          >
            Clear dates
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

      {isPending ? (
        <p className="text-muted-foreground text-sm">Loading payments...</p>
      ) : isError ? (
        <p className="text-destructive text-sm">Unable to load payments.</p>
      ) : data.items.length === 0 ? (
        <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
          No payments to show yet.
        </p>
      ) : (
        <>
          <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-left text-xs tracking-wide uppercase">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Patient</th>
                    <th className="px-4 py-3 font-medium">Clinic</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-muted/40 border-t transition-colors"
                    >
                      <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                        {formatDateTime(payment.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {payment.patient_name}
                      </td>
                      <td className="px-4 py-3">{payment.clinic_name}</td>
                      <td className="px-4 py-3 font-medium">
                        {formatAmount(payment.amount, payment.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                      <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                        {payment.provider_payment_id ?? "—"}
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
