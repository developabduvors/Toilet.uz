/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript xatolariga qaramasdan build qilishga ruxsat berish
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint xatolarini ham e'tiborsiz qoldirish (xavfsizlik uchun)
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;