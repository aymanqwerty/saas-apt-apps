import type { Metadata } from "next";

import { SettingsForm } from "@/features/settings/components/SettingsForm";
import { PageHeader } from "@/shared/components/PageHeader";

export const metadata: Metadata = {
  title: "Website Settings | Doctor Management Platform",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Control what appears on your public website." />
      <SettingsForm />
    </div>
  );
}
