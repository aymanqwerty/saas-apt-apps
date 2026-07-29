"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBlogCategory,
  createGalleryPost,
  deleteBlogCategory,
  deleteGalleryPost,
  listBlogCategories,
  listGallery,
  updateBlogCategory,
  updateGalleryPost,
  type GalleryPayload,
} from "@/shared/services/api/gallery.service";

export const GALLERY_QUERY_KEY = ["gallery"] as const;
export const BLOG_CATEGORIES_QUERY_KEY = ["gallery", "categories"] as const;

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

// -------------------------------------------------------------- categories
export function useBlogCategories() {
  return useQuery({
    queryKey: BLOG_CATEGORIES_QUERY_KEY,
    queryFn: listBlogCategories,
  });
}

export function useCreateBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createBlogCategory(name),
    meta: { successMessage: "Category saved" },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BLOG_CATEGORIES_QUERY_KEY }),
  });
}

export function useUpdateBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateBlogCategory(id, { name }),
    meta: { successMessage: "Category updated" },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BLOG_CATEGORIES_QUERY_KEY }),
  });
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBlogCategory(id),
    meta: { successMessage: "Category deleted" },
    onSuccess: () => {
      // Posts in the category become uncategorised, so refresh both lists.
      queryClient.invalidateQueries({ queryKey: BLOG_CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY });
    },
  });
}
