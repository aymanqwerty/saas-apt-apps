"use client";

import Image from "next/image";
import { useState } from "react";

import { mediaUrl } from "@/shared/services/api/client";

/** Bundled placeholder used when a post has no cover, or its cover won't load. */
export const DEFAULT_COVER = "/default-cover.svg";

/**
 * Cover image with a built-in fallback.
 *
 * A missing cover is easy to handle server-side, but an image that 404s or
 * fails to decode can only be detected in the browser — hence the client
 * component and the onError swap.
 */
export function PostCoverImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: {
  src: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? DEFAULT_COVER : mediaUrl(src);

  const common = {
    src: resolved,
    className,
    onError: () => setFailed(true),
    // The placeholder is a local SVG; the optimizer adds nothing and would
    // need dangerouslyAllowSVG to handle it at all.
    unoptimized: resolved === DEFAULT_COVER,
  };

  if (fill) {
    return <Image {...common} alt={alt} fill sizes={sizes} priority={priority} />;
  }
  return (
    <Image
      {...common}
      alt={alt}
      width={width ?? 800}
      height={height ?? 450}
      priority={priority}
    />
  );
}
