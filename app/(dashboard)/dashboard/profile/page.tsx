import type { Metadata } from "next";

import { ProfileForm } from "@/features/doctor/components/ProfileForm";
import { PageHeader } from "@/shared/components/PageHeader";

export const metadata: Metadata = {
  title: "Profile | Doctor Management Platform",
};

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Manage your professional information shown on your public website." />
      <ProfileForm />
      <p className="text-muted-foreground border-t pt-6 text-center text-xs">
        Developed and managed by Ayman Akram
      </p>
    </div>
  );
}
