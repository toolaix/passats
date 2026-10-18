import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // pdf-parse uses Node fs; keep it server-only
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
