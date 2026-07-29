import type { Metadata } from "next";

import { EditPostView } from "@/features/gallery/components/EditPostView";

export const metadata: Metadata = {
  title: "Edit Post | Doctor Management Platform",
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return <EditPostView postId={postId} />;
}
