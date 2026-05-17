import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  experimental: {
    // Disable dev overlay
    disableUnsafeInlineCSS: false,
  },
};

export default nextConfig;
