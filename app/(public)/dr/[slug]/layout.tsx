import { notFound } from "next/navigation";

import { PublicNav } from "@/features/public-site/components/PublicNav";
import {
  fetchPublicSettings,
  fetchPublicSite,
} from "@/shared/services/api/public.server";

export default async function DoctorSiteLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  const site = await fetchPublicSite(slug);
  if (!site) notFound();
  const settings = await fetchPublicSettings(slug);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav
        slug={slug}
        doctorName={site.doctor.full_name}
        showGallery={settings?.gallery_enabled ?? true}
        sectionLabel={settings?.section_label ?? "Success Stories"}
        showBooking={settings?.booking_enabled ?? true}
      />
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col gap-1 px-6 py-8 text-sm">
          <span className="text-foreground font-medium">
            {site.doctor.full_name}
          </span>
          <span>{site.doctor.specialization}</span>
          <span>
            © {new Date().getFullYear()} {site.doctor.full_name}. All rights
            reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
