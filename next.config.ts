import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    formats: ["image/avif", "image/webp"]
  },
  experimental: {
    optimizePackageImports: ["framer-motion"]
  }
};

export default nextConfig;
