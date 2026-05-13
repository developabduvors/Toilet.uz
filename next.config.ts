import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Build paytida TS xatolarini blocker qilmaslik (CI'da alohida tekshiring)
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Google profil rasmi
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Cloudinary (kelajakda)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
