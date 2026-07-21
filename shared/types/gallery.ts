export type GalleryStatus = "DRAFT" | "PUBLISHED" | "HIDDEN";

export type MediaType = "image" | "youtube" | "instagram";

export interface MediaItem {
  type: MediaType;
  url: string;
}

export interface GalleryPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string | null;
  media: MediaItem[];
  tags: string[];
  status: GalleryStatus;
  published_at: string | null;
  created_at: string;
}

export interface PublicGalleryItem {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  thumbnail: string | null;
  published_at: string | null;
}

export interface PublicGalleryDetail {
  title: string;
  slug: string;
  description: string;
  category: string | null;
  media: MediaItem[];
  tags: string[];
  published_at: string | null;
}
