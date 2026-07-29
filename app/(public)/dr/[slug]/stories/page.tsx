import Link from "next/link";
import { notFound } from "next/navigation";

import { PostCoverImage } from "@/features/public-site/components/PostCoverImage";
import {
  fetchPublicGallery,
  fetchPublicGalleryCategories,
  fetchPublicSettings,
} from "@/shared/services/api/public.server";

const PAGE_SIZE = 9;

function formatDate(item: { display_date: string | null; published_at: string | null }) {
  const raw = item.display_date ?? item.published_at;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.valueOf())
    ? null
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export default async function StoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { category, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [settings, result, categories] = await Promise.all([
    fetchPublicSettings(slug),
    fetchPublicGallery(slug, { category, page, limit: PAGE_SIZE }),
    fetchPublicGalleryCategories(slug),
  ]);

  // The section is either disabled or the doctor doesn't exist.
  if (!result) notFound();

  const label = settings?.section_label ?? "Success Stories";
  const posts = result.items;
  const totalPages = result.meta.total_pages;

  const hrefFor = (nextCategory?: string, nextPage = 1) => {
    const params = new URLSearchParams();
    if (nextCategory) params.set("category", nextCategory);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return `/dr/${slug}/stories${query ? `?${query}` : ""}`;
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{label}</h1>
        <p className="text-muted-foreground text-sm">
          Stories, updates and milestones from our practice.
        </p>
      </header>

      {categories && categories.length > 0 && (
        <nav className="flex flex-wrap gap-2" aria-label="Filter by category">
          <Link
            href={hrefFor()}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
              !category
                ? "bg-foreground text-background border-foreground"
                : "hover:bg-muted"
            }`}
          >
            All
          </Link>
          {categories.map((item) => (
            <Link
              key={item.slug}
              href={hrefFor(item.slug)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                category === item.slug
                  ? "bg-foreground text-background border-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {item.name}
              <span className="text-muted-foreground ml-1.5 text-xs">
                {item.post_count}
              </span>
            </Link>
          ))}
        </nav>
      )}

      {posts.length === 0 ? (
        <p className="text-muted-foreground rounded-xl border p-10 text-center text-sm">
          Nothing published here yet. Please check back soon.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const date = formatDate(post);
            return (
              <li key={post.id} className="flex">
                {/* The whole card is one link, so anywhere on it opens the
                    post. "Read more" is therefore a span, not a nested <a> —
                    nesting anchors is invalid HTML and breaks keyboard focus. */}
                <Link
                  href={`/dr/${slug}/stories/${post.slug}`}
                  className="group focus-visible:ring-ring flex w-full flex-col overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                    <PostCoverImage
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    {date && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
                        {date}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-4">
                    {post.category_name && (
                      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        {post.category_name}
                      </span>
                    )}
                    <h2 className="text-lg font-semibold leading-snug group-hover:underline">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3 text-sm">
                      {post.introduction}
                    </p>
                    <span className="mt-auto pt-2 text-sm font-medium underline underline-offset-4">
                      Read more
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          {page > 1 && (
            <Link
              href={hrefFor(category, page - 1)}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Previous
            </Link>
          )}
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={hrefFor(category, page + 1)}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
