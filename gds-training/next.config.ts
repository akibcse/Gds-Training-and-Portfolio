import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"]
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "gds-training.vercel.app",
          },
        ],
        destination: "https://akibhasan.online/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "training.airtechaviation.click",
          },
        ],
        destination: "https://akibhasan.online/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "airtech-aviation-ota.vercel.app",
          },
        ],
        destination: "https://akibhasan.online/:path*",
        permanent: true,
      },
    ];
  }
};

export default nextConfig;
