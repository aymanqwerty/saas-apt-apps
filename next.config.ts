import type { NextConfig } from "next";

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port: string;
  pathname: string;
};

/**
 * Hosts the image optimizer is allowed to fetch from.
 *
 * Anything not listed here returns 400 from the optimizer, which is how
 * profile photos broke in production: only localhost:8000 was whitelisted, so
 * every <Image> pointing at the deployed API failed. Derived from env rather
 * than hardcoded so the deployed host cannot drift out of this list again.
 */
function buildRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [
    // Local development API.
    { protocol: "http", hostname: "localhost", port: "8000", pathname: "/media/**" },
    // Media served straight from the GCS bucket (MEDIA_STORAGE_PROVIDER=gcs).
    { protocol: "https", hostname: "storage.googleapis.com", port: "", pathname: "/**" },
  ];

  // The deployed API origin (e.g. https://saas-apt-api-xxxx.run.app).
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const { protocol, hostname, port } = new URL(apiUrl);
      patterns.push({
        protocol: protocol.replace(":", "") === "http" ? "http" : "https",
        hostname,
        port,
        pathname: "/media/**",
      });
    } catch {
      // A malformed URL must not break the build; the pattern is simply absent.
    }
  }

  // Optional CDN / custom domain in front of the bucket.
  const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOST;
  if (mediaHost) {
    patterns.push({ protocol: "https", hostname: mediaHost, port: "", pathname: "/**" });
  }

  return patterns;
}

const nextConfig: NextConfig = {
  // Emit a minimal, self-contained server bundle for Docker (.next/standalone).
  output: "standalone",
  images: {
    remotePatterns: buildRemotePatterns(),
  },
};

export default nextConfig;
