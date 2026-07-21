import type { Metadata } from "next";

import { PaymentList } from "@/features/payments/components/PaymentList";
import { PageHeader } from "@/shared/components/PageHeader";

export const metadata: Metadata = {
  title: "Payments | Doctor Management Platform",
};

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Advance payments collected for online bookings." />
      <PaymentList />
    </div>
  );
}
