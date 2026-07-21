import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountDashboard } from "@/features/patient-account/components/AccountDashboard";
import { fetchPublicDoctor } from "@/shared/services/api/public.server";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function PatientAccountPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await fetchPublicDoctor(slug);
  if (!profile) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">My Account</h1>
        <p className="text-muted-foreground text-sm">
          Manage your details, family members and appointments with{" "}
          {profile.doctor.full_name}.
        </p>
      </div>
      <AccountDashboard slug={slug} />
    </div>
  );
}
