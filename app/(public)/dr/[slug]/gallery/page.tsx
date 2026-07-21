import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { API_ORIGIN } from "@/shared/services/api/client";
import { fetchPublicGallery } from "@/shared/services/api/public.server";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await fetchPublicGallery(slug);
  if (posts === null) notFound();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Success Stories</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts published yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/dr/${slug}/gallery/${post.slug}`}
              className="group flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              {post.thumbnail ? (
                <Image
                  src={
                    post.thumbnail.startsWith("http")
                      ? post.thumbnail
                      : `${API_ORIGIN}${post.thumbnail}`
                  }
                  alt={post.title}
                  width={400}
                  height={240}
                  className="h-40 w-full rounded-md object-cover"
                  unoptimized
                />
              ) : (
                <div className="bg-muted h-40 w-full rounded-md" />
              )}
              <div>
                <h2 className="font-medium">{post.title}</h2>
                <p className="text-muted-foreground text-sm">
                  {post.category ?? "Case"}
                  {post.published_at && ` · ${post.published_at.slice(0, 10)}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
