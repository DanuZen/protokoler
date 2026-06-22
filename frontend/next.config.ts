import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
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
