import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
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
