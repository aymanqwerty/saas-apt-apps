import { apiFetch } from "@/shared/services/api/client";
import type {
  GalleryPost,
  GalleryStatus,
  MediaItem,
} from "@/shared/types/gallery";

export interface GalleryPayload {
  title: string;
  description: string;
  category?: string | null;
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

export function createGalleryPost(payload: GalleryPayload): Promise<GalleryPost> {
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
