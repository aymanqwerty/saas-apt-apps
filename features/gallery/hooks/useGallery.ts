"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createGalleryPost,
  deleteGalleryPost,
  listGallery,
  updateGalleryPost,
  type GalleryPayload,
} from "@/shared/services/api/gallery.service";

export const GALLERY_QUERY_KEY = ["gallery"] as const;

export function useGallery() {
  return useQuery({ queryKey: GALLERY_QUERY_KEY, queryFn: listGallery });
}

export function useCreateGalleryPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GalleryPayload) => createGalleryPost(payload),
    meta: { successMessage: "Post saved" },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY }),
  });
}

export function useUpdateGalleryPost(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<GalleryPayload>) => updateGalleryPost(id, payload),
    meta: { successMessage: "Post updated" },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY }),
  });
}

export function useDeleteGalleryPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGalleryPost(id),
    meta: { successMessage: "Post deleted" },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY }),
  });
}
