export type GalleryStatus = "DRAFT" | "PUBLISHED" | "HIDDEN";

export type MediaType = "image" | "youtube" | "instagram";

export interface MediaItem {
  type: MediaType;
  url: string;
  /** Rich-text caption (sanitised server-side). */
  description?: string | null;
}

/** Response shape — the server derives these so we never parse URLs or HTML. */
export interface MediaItemOut extends MediaItem {
  youtube_id: string | null;
  /** Shortcode for the Instagram embed; null when the link isn't embeddable. */
  instagram_id: string | null;
  /** "p" | "reel" | "tv" — reels are portrait, posts roughly square. */
  instagram_kind: string | null;
  /** Plain-text form of `description`, for alt attributes. */
  description_text: string | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number | null;
}

export interface GalleryPost {
  id: string;
  title: string;
  slug: string;
  introduction: string;
  body: string | null;
  cover_image: string | null;
  category_id: string | null;
  category_name: string | null;
  display_order: number | null;
  display_date: string | null;
  media: MediaItemOut[];
  tags: string[];
  status: GalleryStatus;
  published_at: string | null;
  created_at: string;
}

export interface PublicGalleryItem {
  id: string;
  title: string;
  slug: string;
  introduction: string;
  cover_image: string | null;
  category_name: string | null;
  category_slug: string | null;
  display_date: string | null;
  published_at: string | null;
}

export interface PublicGalleryDetail {
  title: string;
  slug: string;
  introduction: string;
  body: string | null;
  cover_image: string | null;
  category_name: string | null;
  category_slug: string | null;
  display_date: string | null;
  media: MediaItemOut[];
  tags: string[];
  published_at: string | null;
}

export interface PublicBlogCategory {
  name: string;
  slug: string;
  post_count: number;
}
