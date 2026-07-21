import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Uploaded media is served by the FastAPI backend under /media.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
