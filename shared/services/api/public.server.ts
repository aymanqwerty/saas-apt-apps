import type { ApiResponse } from "@/shared/types/api";
import type { PublicDoctorProfile, PublicSite } from "@/shared/types/booking";
import type {
  PublicGalleryDetail,
  PublicGalleryItem,
} from "@/shared/types/gallery";
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
): Promise<PublicGalleryItem[] | null> {
  return fetchPublic<PublicGalleryItem[]>(
    `/doctors/public/${encodeURIComponent(slug)}/gallery`,
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
