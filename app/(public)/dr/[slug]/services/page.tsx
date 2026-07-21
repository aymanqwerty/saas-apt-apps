import { notFound } from "next/navigation";

import { fetchPublicSite } from "@/shared/services/api/public.server";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await fetchPublicSite(slug);
  if (!site) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Services</h1>

      {site.services.length === 0 ? (
        <p className="text-muted-foreground">No services listed yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {site.services.map((service) => (
            <div key={service.id} className="rounded-lg border p-5">
              <h2 className="font-medium">{service.title}</h2>
              {service.description && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {service.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
