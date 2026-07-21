import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PatientAuthFlow } from "@/features/patient-account/components/PatientAuthFlow";
import { fetchPublicDoctor } from "@/shared/services/api/public.server";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function PatientLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await fetchPublicDoctor(slug);
  if (!profile) notFound();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 py-16">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile.doctor.full_name}
        </h1>
        <p className="text-muted-foreground text-sm">
          Sign in to book faster and manage your appointments.
        </p>
      </div>
      <Suspense>
        <PatientAuthFlow slug={slug} />
      </Suspense>
    </div>
  );
}
