import type { Metadata } from "next";

import { AvailabilityManager } from "@/features/availability/components/AvailabilityManager";
import { PageHeader } from "@/shared/components/PageHeader";

export const metadata: Metadata = {
  title: "Availability | Doctor Management Platform",
};

export default function AvailabilityPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Configure your weekly schedule and exceptions. Booking slots are generated automatically." />
      <AvailabilityManager />
    </div>
  );
}
