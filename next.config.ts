import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
