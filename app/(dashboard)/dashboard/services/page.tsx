import type { Metadata } from "next";

import { ServiceList } from "@/features/services/components/ServiceList";
import { PageHeader } from "@/shared/components/PageHeader";

export const metadata: Metadata = {
  title: "Services | Doctor Management Platform",
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Manage the treatments and procedures shown on your public website." />
      <ServiceList />
    </div>
  );
}
