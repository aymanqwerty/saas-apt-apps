import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import type { PublicClinic } from "@/shared/types/booking";

export function ClinicCard({
  clinic,
  slug,
}: {
  clinic: PublicClinic;
  slug: string;
}) {
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
    <div className="flex flex-col gap-3 rounded-lg border p-5">
      <div>
        <h3 className="font-medium">{clinic.clinic_name}</h3>
        <p className="text-muted-foreground text-sm">{address}</p>
      </div>
      <div className="text-muted-foreground flex flex-col gap-1 text-sm">
        {clinic.phone_number && <span>Phone: {clinic.phone_number}</span>}
        {clinic.consultation_fee && (
          <span>Consultation fee: ₹{clinic.consultation_fee}</span>
        )}
      </div>
      <div className="mt-1 flex flex-wrap gap-2">
        {clinic.google_maps_url && (
          <Button variant="outline" size="sm" render={<a href={clinic.google_maps_url} target="_blank" rel="noopener noreferrer" />}>
            View on map
          </Button>
        )}
        <Button size="sm" render={<Link href={`/dr/${slug}/book`} />}>
          Book Appointment
        </Button>
      </div>
    </div>
  );
}
