/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Build ve Tip Hatalarını Yoksay (Vercel deployment için)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 2. Görsel Optimizasyonu (v0 bileşenleri için genelde istenir)
  images: {
    unoptimized: true,
  },

  // 3. PROXY (Rewrites) AYARLARI
  // Houston, artık tüm API trafiği buradan Gateway'e akacak.
  async rewrites() {
    return [
      {
        // Frontend: /api/vault/customers -> Gateway: :5000/api/vault/customers
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*', 
      },
      {
        // Auth: /connect/token -> Gateway: :5000/connect/token
        source: '/connect/:path*',
        destination: 'http://localhost:5000/connect/:path*',
      },
    ]
  },
};

export default nextConfig;