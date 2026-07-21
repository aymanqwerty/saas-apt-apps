import { notFound } from "next/navigation";

import { fetchPublicSite } from "@/shared/services/api/public.server";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await fetchPublicSite(slug);
  if (!site) notFound();

  const { doctor } = site;
  const rows: [string, string][] = [
    ["Specialization", doctor.specialization],
    ["Experience", `${doctor.experience_years} years`],
  ];
  if (doctor.qualification) rows.push(["Qualifications", doctor.qualification]);
  if (doctor.languages && doctor.languages.length > 0)
    rows.push(["Languages", doctor.languages.join(", ")]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        About {doctor.full_name}
      </h1>

      {doctor.about && (
        <p className="text-muted-foreground leading-relaxed">{doctor.about}</p>
      )}

      <dl className="grid gap-4 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg border p-4">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="mt-1 font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
