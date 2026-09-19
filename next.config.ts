import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
