import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClinicCard } from "@/features/public-site/components/ClinicCard";
import { Button } from "@/shared/components/ui/button";
import { mediaUrl } from "@/shared/services/api/client";
import {
  fetchPublicSettings,
  fetchPublicSite,
} from "@/shared/services/api/public.server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await fetchPublicSite(slug);
  if (!site) return { title: "Doctor not found" };
  return {
    title: `${site.doctor.full_name} — ${site.doctor.specialization}`,
    description: site.doctor.about ?? undefined,
  };
}

export default async function DoctorHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await fetchPublicSite(slug);
  if (!site) notFound();
  const settings = await fetchPublicSettings(slug);
  const bookingEnabled = settings?.booking_enabled ?? true;
  const sectionLabel = settings?.section_label ?? "Success Stories";

  const { doctor, clinics, services } = site;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-12">
      {/* Hero */}
      <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        {doctor.profile_photo && (
          <Image
            src={mediaUrl(doctor.profile_photo)}
            alt={doctor.full_name}
            width={128}
            height={128}
            className="size-32 rounded-full border object-cover"
          />
        )}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {doctor.full_name}
          </h1>
          <p className="text-muted-foreground">
            {doctor.specialization}
            {doctor.qualification && ` · ${doctor.qualification}`}
          </p>
          <p className="text-muted-foreground text-sm">
            {doctor.experience_years} years of experience
          </p>
          {bookingEnabled && (
            <div className="mt-2">
              <Button render={<Link href={`/dr/${slug}/book`} />}>
                Book Appointment
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Quick info */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <QuickCard label="Experience" value={`${doctor.experience_years} yrs`} />
        <QuickCard label="Clinics" value={String(clinics.length)} />
        <QuickCard
          label="Languages"
          value={doctor.languages?.join(", ") || "—"}
        />
      </section>

      {/* About */}
      {doctor.about && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">About</h2>
          <p className="text-muted-foreground leading-relaxed">{doctor.about}</p>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Services</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.id} className="rounded-lg border p-4">
                <h3 className="font-medium">{service.title}</h3>
                {service.description && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {service.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Blog section preview — heading uses the doctor's chosen wording. */}
      {site.gallery.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{sectionLabel}</h2>
            <Link
              href={`/dr/${slug}/stories`}
              className="text-muted-foreground text-sm hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {site.gallery.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={`/dr/${slug}/stories/${post.slug}`}
                className="hover:bg-muted/50 flex flex-col gap-2 rounded-lg border p-3"
              >
                {post.cover_image ? (
                  <Image
                    src={mediaUrl(post.cover_image)}
                    alt={post.title}
                    width={300}
                    height={160}
                    className="h-32 w-full rounded-md object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="bg-muted h-32 w-full rounded-md" />
                )}
                <span className="text-sm font-medium">{post.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Clinics */}
      {clinics.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Clinics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {clinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} slug={slug} />
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <ContactBlock slug={slug} />
      </section>
    </div>
  );
}

function QuickCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

async function ContactBlock({ slug }: { slug: string }) {
  const site = await fetchPublicSite(slug);
  if (!site) return null;
  return (
    <ul className="text-muted-foreground flex flex-col gap-2 text-sm">
      {site.clinics.map((clinic) => (
        <li key={clinic.id}>
          <span className="text-foreground font-medium">{clinic.clinic_name}</span>
          {" — "}
          {[clinic.address_line_1, clinic.city, clinic.state]
            .filter(Boolean)
            .join(", ")}
          {clinic.phone_number && ` · ${clinic.phone_number}`}
        </li>
      ))}
    </ul>
  );
}
