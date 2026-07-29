import { apiFetch } from "@/shared/services/api/client";
import type {
  BlogCategory,
  GalleryPost,
  GalleryStatus,
  MediaItem,
} from "@/shared/types/gallery";

export interface GalleryPayload {
  title: string;
  introduction: string;
  body?: string | null;
  cover_image?: string | null;
  category_id?: string | null;
  display_order?: number | null;
  display_date?: string | null;
  media?: MediaItem[];
  tags?: string[];
  status?: GalleryStatus;
}

export function listGallery(): Promise<GalleryPost[]> {
  return apiFetch<GalleryPost[]>("/gallery");
}

export function getGalleryPost(id: string): Promise<GalleryPost> {
  return apiFetch<GalleryPost>(`/gallery/${id}`);
}

export function createGalleryPost(
  payload: GalleryPayload,
): Promise<GalleryPost> {
  return apiFetch<GalleryPost>("/gallery", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateGalleryPost(
  id: string,
  payload: Partial<GalleryPayload>,
): Promise<GalleryPost> {
  return apiFetch<GalleryPost>(`/gallery/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteGalleryPost(id: string): Promise<null> {
  return apiFetch<null>(`/gallery/${id}`, { method: "DELETE" });
}

// ------------------------------------------------------------- categories
export function listBlogCategories(): Promise<BlogCategory[]> {
  return apiFetch<BlogCategory[]>("/gallery/categories");
}

/** Creating with an existing name reuses that category server-side. */
export function createBlogCategory(name: string): Promise<BlogCategory> {
  return apiFetch<BlogCategory>("/gallery/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function updateBlogCategory(
  id: string,
  payload: { name?: string; display_order?: number | null },
): Promise<BlogCategory> {
  return apiFetch<BlogCategory>(`/gallery/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteBlogCategory(id: string): Promise<null> {
  return apiFetch<null>(`/gallery/categories/${id}`, { method: "DELETE" });
}
