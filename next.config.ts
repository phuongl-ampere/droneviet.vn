import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return [
      {
        source: "/giai-phap",
        destination: "/dich-vu",
        permanent: true,
      },
      {
        source: "/en/solutions",
        destination: "/en/services",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(/\/$/, "");

    if (!apiUrl) {
      return [];
    }

    return [
      {
        source: "/media/articles/:path*",
        destination: `${apiUrl}/media/articles/:path*`,
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
