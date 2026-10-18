import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // pdf-parse / mammoth need Node; keep server-only on OpenNext CF (nodejs_compat).
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;

// Enable Cloudflare bindings during `next dev` (no-op if wrangler missing).
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
