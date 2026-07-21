"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { GalleryFormDialog } from "@/features/gallery/components/GalleryFormDialog";
import {
  useDeleteGalleryPost,
  useGallery,
} from "@/features/gallery/hooks/useGallery";
import { Button } from "@/shared/components/ui/button";
import type { GalleryPost, GalleryStatus } from "@/shared/types/gallery";

const STATUS_STYLES: Record<GalleryStatus, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-amber-50 text-amber-700",
  HIDDEN: "bg-muted text-muted-foreground",
};

export function GalleryManager() {
  const { data, isPending, isError } = useGallery();
  const deleteMutation = useDeleteGalleryPost();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryPost | undefined>();

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };
  const openEdit = (post: GalleryPost) => {
    setEditing(post);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          Create Post
        </Button>
      </div>

      {isPending ? (
        <p className="text-muted-foreground text-sm">
          Loading success stories...
        </p>
      ) : isError ? (
        <p className="text-destructive text-sm">
          Unable to load success stories.
        </p>
      ) : data.length === 0 ? (
        <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
          No posts yet. Create a post to showcase your work.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.map((post) => (
            <li
              key={post.id}
              className="bg-card flex flex-col gap-2 rounded-xl border p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{post.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[post.status]}`}
                >
                  {post.status}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                {post.category ?? "Uncategorized"}
                {post.published_at &&
                  ` · ${post.published_at.slice(0, 10)}`}
              </p>
              <div className="mt-1 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(post)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(post.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <GalleryFormDialog
        key={editing?.id ?? "new"}
        post={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
