import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { mediaUrl } from "@/shared/services/api/client";
import { fetchPublicGalleryPost } from "@/shared/services/api/public.server";

function youtubeEmbed(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default async function GalleryPostPage({
  params,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
}) {
  const { slug, postSlug } = await params;
  const post = await fetchPublicGalleryPost(slug, postSlug);
  if (!post) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <Link
        href={`/dr/${slug}/gallery`}
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to success stories
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{post.title}</h1>
        {post.category && (
          <p className="text-muted-foreground text-sm">{post.category}</p>
        )}
      </header>

      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
        {post.description}
      </p>

      <div className="flex flex-col gap-4">
        {post.media.map((item, index) => {
          if (item.type === "image") {
            return (
              <Image
                key={index}
                src={mediaUrl(item.url)}
                alt={`${post.title} ${index + 1}`}
                width={800}
                height={480}
                className="w-full rounded-lg object-cover"
                unoptimized
              />
            );
          }
          if (item.type === "youtube") {
            const embed = youtubeEmbed(item.url);
            return embed ? (
              <div key={index} className="aspect-video w-full">
                <iframe
                  src={embed}
                  title={`Video ${index + 1}`}
                  className="h-full w-full rounded-lg"
                  allowFullScreen
                />
              </div>
            ) : null;
          }
          return (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm underline"
            >
              View on Instagram
            </a>
          );
        })}
      </div>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-muted rounded-full px-2 py-0.5 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
