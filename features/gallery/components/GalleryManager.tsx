"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff, Plus, Tags } from "lucide-react";
import { useMemo, useState } from "react";

import { CategoryManagerDialog } from "@/features/gallery/components/CategoryManagerDialog";
import {
  useDeleteGalleryPost,
  useGallery,
} from "@/features/gallery/hooks/useGallery";
import { Button } from "@/shared/components/ui/button";
import { mediaUrl } from "@/shared/services/api/client";
import type { GalleryStatus } from "@/shared/types/gallery";

const STATUS_STYLES: Record<GalleryStatus, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-amber-50 text-amber-700",
  HIDDEN: "bg-muted text-muted-foreground",
};

const STATUS_FILTERS = ["ALL", "PUBLISHED", "DRAFT", "HIDDEN"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? "—"
    : date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

export function GalleryManager() {
  const { data, isPending, isError } = useGallery();
  const deleteMutation = useDeleteGalleryPost();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const posts = useMemo(() => {
    if (!data) return [];
    return statusFilter === "ALL"
      ? data
      : data.filter((post) => post.status === statusFilter);
  }, [data, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                statusFilter === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {value === "ALL" ? "All" : value.charAt(0) + value.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCategoriesOpen(true)}>
            <Tags className="size-4" />
            Categories
          </Button>
          <Button size="sm" render={<Link href="/dashboard/gallery/new" />}>
            <Plus className="size-4" />
            Create Post
          </Button>
        </div>
      </div>

      {isPending ? (
        <p className="text-muted-foreground text-sm">Loading blog posts...</p>
      ) : isError ? (
        <p className="text-destructive text-sm">Unable to load blog posts.</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground bg-card rounded-xl border p-10 text-center text-sm shadow-sm">
          {statusFilter === "ALL"
            ? "No posts yet. Create a post to showcase your work."
            : `No ${statusFilter.toLowerCase()} posts.`}
        </p>
      ) : (
        <div className="bg-card overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="text-muted-foreground border-b text-left text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Cover</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, index) => (
                <tr key={post.id} className="border-b last:border-0">
                  <td className="text-muted-foreground px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">
                    {post.cover_image ? (
                      <Image
                        src={mediaUrl(post.cover_image)}
                        alt=""
                        width={56}
                        height={40}
                        className="h-10 w-14 rounded border object-cover"
                      />
                    ) : (
                      <div className="bg-muted text-muted-foreground flex h-10 w-14 items-center justify-center rounded border">
                        <ImageOff className="size-4" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{post.title}</span>
                    <span className="text-muted-foreground block text-xs">
                      /{post.slug}
                    </span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {post.category_name ?? "Uncategorized"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {post.display_order ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[post.status]}`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/dashboard/gallery/${post.id}`} />}
                      >
                        Edit
                      </Button>
                      {pendingDelete === post.id ? (
                        <>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              deleteMutation.mutate(post.id);
                              setPendingDelete(null);
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPendingDelete(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setPendingDelete(post.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CategoryManagerDialog
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
      />
    </div>
  );
}
