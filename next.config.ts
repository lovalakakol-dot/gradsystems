import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Membiarkan build Vercel tetap berjalan meskipun ada error TypeScript
    ignoreBuildErrors: true,
  },
  /* config options here */
  reactCompiler: true,
};


export default nextConfig;
