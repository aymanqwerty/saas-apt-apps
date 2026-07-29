import type { Metadata } from "next";

import { GalleryManager } from "@/features/gallery/components/GalleryManager";
import { PageHeader } from "@/shared/components/PageHeader";

export const metadata: Metadata = {
  title: "Blog | Doctor Management Platform",
};

export default function GalleryPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Always "Blog" in the admin panel; patients see the doctor's own
          wording for this section, set in Website Settings. */}
      <PageHeader description="Write posts for your website. Patients see this section under the name you choose in Settings." />
      <GalleryManager />
    </div>
  );
}
