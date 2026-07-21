import type { Metadata } from "next";

import { GalleryManager } from "@/features/gallery/components/GalleryManager";
import { PageHeader } from "@/shared/components/PageHeader";

export const metadata: Metadata = {
  title: "Success Stories | Doctor Management Platform",
};

export default function GalleryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Publish treatment cases, success stories, and educational content." />
      <GalleryManager />
    </div>
  );
}
