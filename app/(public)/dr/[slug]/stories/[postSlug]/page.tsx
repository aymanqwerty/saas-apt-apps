// lucide-react dropped brand icons in this version, so Camera stands in.
import { Camera, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostCoverImage } from "@/features/public-site/components/PostCoverImage";
import { RichText } from "@/features/public-site/components/RichText";
import { mediaUrl } from "@/shared/services/api/client";
import {
  fetchPublicGalleryPost,
  fetchPublicSettings,
} from "@/shared/services/api/public.server";

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
}) {
  const { slug, postSlug } = await params;
  const [post, settings] = await Promise.all([
    fetchPublicGalleryPost(slug, postSlug),
    fetchPublicSettings(slug),
  ]);

  if (!post) notFound();

  const label = settings?.section_label ?? "Success Stories";
  const rawDate = post.display_date ?? post.published_at;
  const date = rawDate ? new Date(rawDate) : null;
  const formatted =
    date && !Number.isNaN(date.valueOf())
      ? date.toLocaleDateString(undefined, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  const images = post.media.filter((item) => item.type === "image");
  const videos = post.media.filter(
    (item) => item.type === "youtube" && item.youtube_id,
  );
  const links = post.media.filter((item) => item.type === "instagram");

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <Link
        href={`/dr/${slug}/stories`}
        className="text-muted-foreground w-fit text-sm underline underline-offset-4"
      >
        ← Back to {label}
      </Link>

      <header className="flex flex-col gap-3">
        {post.category_name && (
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {post.category_name}
          </span>
        )}
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
        {formatted && (
          <time className="text-muted-foreground text-sm">{formatted}</time>
        )}
      </header>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-100">
        <PostCoverImage
          src={post.cover_image}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      </div>

      <p className="text-lg leading-relaxed">{post.introduction}</p>

      <RichText
        html={post.body}
        className="leading-relaxed [&_h2]:mt-2 [&_h2]:text-xl [&_h3]:mt-2 [&_h3]:text-lg"
      />

      {images.length > 0 && (
        <section className="flex flex-col gap-4">
          {images.map((item, index) => (
            <figure key={`${item.url}-${index}`} className="flex flex-col gap-2">
              <Image
                src={mediaUrl(item.url)}
                alt={item.description_text ?? post.title}
                width={900}
                height={600}
                className="w-full rounded-xl"
              />
              {item.description && (
                <figcaption>
                  <RichText
                    html={item.description}
                    className="text-muted-foreground text-sm"
                  />
                </figcaption>
              )}
            </figure>
          ))}
        </section>
      )}

      {videos.length > 0 && (
        <section className="flex flex-col gap-4">
          {videos.map((item, index) => (
            <figure key={`${item.url}-${index}`} className="flex flex-col gap-2">
              <div className="aspect-video w-full overflow-hidden rounded-xl">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${item.youtube_id}`}
                  title={item.description_text ?? `Video ${index + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
              {item.description && (
                <figcaption>
                  <RichText
                    html={item.description}
                    className="text-muted-foreground text-sm"
                  />
                </figcaption>
              )}
            </figure>
          ))}
        </section>
      )}

      {links.length > 0 && (
        <section className="flex flex-col gap-4">
          {links.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              className="flex flex-col gap-3 rounded-xl border p-4"
            >
              <div className="flex items-center gap-2">
                <Camera className="size-4 shrink-0 text-[#C13584]" />
                <span className="text-sm font-medium">Instagram</span>
              </div>

              {/* Instagram's /embed/ iframe needs no API key. Reels are
                  portrait, posts roughly square, so the frame differs. Posts
                  that are private or age-gated render an empty card — the
                  link below is always there as a way through. */}
              {item.instagram_id && (
                <div
                  className={
                    item.instagram_kind === "reel"
                      ? "mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-lg border"
                      : "mx-auto h-[640px] w-full max-w-lg overflow-hidden rounded-lg border"
                  }
                >
                  <iframe
                    src={`https://www.instagram.com/${item.instagram_kind}/${item.instagram_id}/embed`}
                    title={item.description_text ?? `Instagram post ${index + 1}`}
                    loading="lazy"
                    allowFullScreen
                    scrolling="no"
                    className="h-full w-full border-0"
                  />
                </div>
              )}

              {/* The description is prose, not a link — only the button is. */}
              <RichText html={item.description} className="text-sm" />

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
              >
                View on Instagram
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          ))}
        </section>
      )}

      {post.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-2">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="text-muted-foreground rounded-full border px-2.5 py-1 text-xs"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
