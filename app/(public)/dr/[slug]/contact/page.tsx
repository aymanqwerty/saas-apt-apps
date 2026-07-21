import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/shared/components/ui/button";
import { fetchPublicSite } from "@/shared/services/api/public.server";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await fetchPublicSite(slug);
  if (!site) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>

      {site.clinics.length === 0 ? (
        <p className="text-muted-foreground">No clinic locations available.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {site.clinics.map((clinic) => {
            const address = [
              clinic.address_line_1,
              clinic.address_line_2,
              clinic.city,
              clinic.state,
              clinic.country,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <li key={clinic.id} className="rounded-lg border p-5">
                <h2 className="font-medium">{clinic.clinic_name}</h2>
                <p className="text-muted-foreground text-sm">{address}</p>
                {clinic.phone_number && (
                  <p className="text-muted-foreground text-sm">
                    Phone: {clinic.phone_number}
                  </p>
                )}
                {clinic.google_maps_url && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <a
                          href={clinic.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      View on map
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <Button render={<Link href={`/dr/${slug}/book`} />}>
          Book Appointment
        </Button>
      </div>
    </div>
  );
}
