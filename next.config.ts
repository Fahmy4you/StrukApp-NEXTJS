import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth',
        permanent: true, // Gunakan true agar SEO & Browser langsung mengingat redirect ini
      },
    ]
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['struk.bydils.site', 'localhost:3000'],
    },
  },
};

export default nextConfig;
