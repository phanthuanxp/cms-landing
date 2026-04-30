import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/admincp/:path*",
        destination: "/admin/:path*"
      }
    ];
  }
};

export default nextConfig;
