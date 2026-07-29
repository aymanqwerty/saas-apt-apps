"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { PostEditor } from "@/features/gallery/components/PostEditor";
import { getGalleryPost } from "@/shared/services/api/gallery.service";

export function EditPostView({ postId }: { postId: string }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["gallery", postId],
    queryFn: () => getGalleryPost(postId),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard/gallery"
          className="text-muted-foreground w-fit text-sm hover:underline"
        >
          ← Back to Blog
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {data ? data.title : "Edit Post"}
        </h1>
      </div>

      {isPending ? (
        <p className="text-muted-foreground text-sm">Loading post...</p>
      ) : isError || !data ? (
        <p className="text-destructive text-sm">Unable to load this post.</p>
      ) : (
        // Remount when the loaded post changes so the form re-seeds cleanly.
        <PostEditor key={data.id} post={data} />
      )}
    </div>
  );
}
