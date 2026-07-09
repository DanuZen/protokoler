import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'fayiskomrdikxpmjhyct.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'protokoler.unp.ac.id',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '7860',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '7860',
      },
    ],
  },
  // ─── DEMO MODE ───────────────────────────────────────────────────────────
  // Rewrite ke backend dinonaktifkan. Semua data menggunakan mock API lokal.
  // Aktifkan kembali blok di bawah jika backend sudah siap digunakan:
  //
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
