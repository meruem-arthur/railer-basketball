import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Admin photo uploads go through Server Actions (the default limit is 1MB). Photos are also scaled down in the browser.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  images: {
    remotePatterns: [
      {
        // Placeholder photos used in dev/seed data
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        // Real player/news/gallery photos, once uploads go through Cloudinary
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
