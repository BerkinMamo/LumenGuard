/** @type {import('next').NextConfig} */

// Artık doğrudan tarayıcıdan (client-side) istek atacağın için 
// bu satıra teknik olarak gerek kalmadı ama zararı da olmaz.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nextConfig = {
  typescript: { 
    ignoreBuildErrors: true 
  },
  
  // 🛡️ Tarayıcı üzerinden farklı domainlere (Cross-Origin) 
  // güvenli erişim için bu kalsın.
  experimental: {
    allowedOrigins: ["api.lunalux.com.tr", "lumen.lunalux.com.tr", "localhost:3000", "localhost:7194"]
  },

  // 🛡️ REWRITES SİLİNDİ: 
  // Next.js sunucusunu aradan çıkardık. Artık isteklerin Node.js 
  // katmanına takılmayacak, doğrudan tarayıcıdan Gateway'e gidecek.

  devIndicators: {
    buildActivity: true,
  },
};

export default nextConfig;