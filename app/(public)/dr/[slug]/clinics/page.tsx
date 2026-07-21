import { notFound } from "next/navigation";

import { ClinicCard } from "@/features/public-site/components/ClinicCard";
import { fetchPublicSite } from "@/shared/services/api/public.server";

export default async function ClinicsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await fetchPublicSite(slug);
  if (!site) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Clinics</h1>

      {site.clinics.length === 0 ? (
        <p className="text-muted-foreground">No clinics listed yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {site.clinics.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
