import type { Metadata } from "next";
import Link from "next/link";

import { PostEditor } from "@/features/gallery/components/PostEditor";

export const metadata: Metadata = {
  title: "New Post | Doctor Management Platform",
};

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard/gallery"
          className="text-muted-foreground w-fit text-sm hover:underline"
        >
          ← Back to Blog
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">New Post</h1>
      </div>
      <PostEditor />
    </div>
  );
}
