import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingWizard } from "@/features/booking/components/BookingWizard";
import {
  fetchPublicDoctor,
  fetchPublicSettings,
} from "@/shared/services/api/public.server";

export const metadata: Metadata = {
  title: "Book Appointment",
};

export default async function BookAppointmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await fetchPublicDoctor(slug);
  if (!profile) notFound();
  const settings = await fetchPublicSettings(slug);
  const bookingEnabled = settings?.booking_enabled ?? true;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Book an Appointment
        </h1>
        <p className="text-muted-foreground text-sm">
          with {profile.doctor.full_name} · {profile.doctor.specialization}
        </p>
      </div>

      {bookingEnabled ? (
        <BookingWizard slug={slug} />
      ) : (
        <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
          Online booking is currently unavailable. Please contact the clinic
          directly.
        </p>
      )}
    </div>
  );
}
