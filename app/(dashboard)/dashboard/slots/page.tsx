import type { Metadata } from "next";

import { SlotManager } from "@/features/slots/components/SlotManager";
import { PageHeader } from "@/shared/components/PageHeader";

export const metadata: Metadata = {
  title: "Slots | Doctor Management Platform",
};

export default function SlotsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="View generated appointment slots. Block slots or adjust capacity as needed." />
      <SlotManager />
    </div>
  );
}
