import type { ApiResponse } from "@/shared/types/api";
import type { PublicDoctorProfile, PublicSite } from "@/shared/types/booking";
import type {
  PublicBlogCategory,
  PublicGalleryDetail,
  PublicGalleryItem,
} from "@/shared/types/gallery";
import type { Page } from "@/shared/types/appointment";
import type { DoctorSettings } from "@/shared/types/settings";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function fetchPublic<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
    if (!response.ok) return null;
    const body = (await response.json()) as ApiResponse<T>;
    return body.success ? body.data : null;
  } catch {
    return null;
  }
}

/** Server-side public doctor fetch. Returns null when not found/unreachable. */
export function fetchPublicDoctor(
  slug: string,
): Promise<PublicDoctorProfile | null> {
  return fetchPublic<PublicDoctorProfile>(
    `/doctors/public/${encodeURIComponent(slug)}`,
  );
}

/** Aggregate site payload: doctor + active clinics + active services + gallery. */
export function fetchPublicSite(slug: string): Promise<PublicSite | null> {
  return fetchPublic<PublicSite>(
    `/doctors/public/${encodeURIComponent(slug)}/site`,
  );
}

export function fetchPublicSettings(
  slug: string,
): Promise<DoctorSettings | null> {
  return fetchPublic<DoctorSettings>(
    `/doctors/public/${encodeURIComponent(slug)}/settings`,
  );
}

export function fetchPublicGallery(
  slug: string,
  options: { category?: string; page?: number; limit?: number } = {},
): Promise<Page<PublicGalleryItem> | null> {
  const params = new URLSearchParams({
    page: String(options.page ?? 1),
    limit: String(options.limit ?? 12),
  });
  if (options.category) params.set("category", options.category);
  return fetchPublic<Page<PublicGalleryItem>>(
    `/doctors/public/${encodeURIComponent(slug)}/gallery?${params.toString()}`,
  );
}

export function fetchPublicGalleryCategories(
  slug: string,
): Promise<PublicBlogCategory[] | null> {
  return fetchPublic<PublicBlogCategory[]>(
    `/doctors/public/${encodeURIComponent(slug)}/gallery/categories`,
  );
}

export function fetchPublicGalleryPost(
  slug: string,
  postSlug: string,
): Promise<PublicGalleryDetail | null> {
  return fetchPublic<PublicGalleryDetail>(
    `/doctors/public/${encodeURIComponent(slug)}/gallery/${encodeURIComponent(postSlug)}`,
  );
}
