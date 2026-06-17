import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "superhome-iraq.store",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nmawdgekleauyusygqot.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
