import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { ClinicList } from "@/features/clinics/components/ClinicList";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/ui/button";

export const metadata: Metadata = {
  title: "Clinics | Doctor Management Platform",
};

export default function ClinicsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Manage the clinics where you practice.">
        <Button size="sm" render={<Link href="/dashboard/clinics/new" />}>
          <Plus className="size-4" />
          Add Clinic
        </Button>
      </PageHeader>
      <ClinicList />
    </div>
  );
}
