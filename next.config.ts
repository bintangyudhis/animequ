import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Optimasi gambar Vercel DIMATIKAN (persetujuan Yudhis 5 Nov
    // 2026): kuota transformasi plan gratis habis pada 2 Nov malam
    // dan poster yang belum terolah dibalas 402 sampai kuota pulih.
    // Poster dimuat langsung dari CDN AniList; kekurangannya hanya
    // tidak ada penyesuaian ukuran otomatis per layar.
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "s4.anilist.co",
        protocol: "https",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
