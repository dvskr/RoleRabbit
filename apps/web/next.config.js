const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  // Disable experimental features that might cause loader issues
  experimental: {
    // Ensure stable build
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      '@roleready/resume-normalizer': path.resolve(__dirname, '../../packages/resume-normalizer'),
      '@roleready/editor-ai-schemas': path.resolve(__dirname, '../../packages/editor-ai-schemas')
    };

    // Ensure proper chunk generation in dev mode
    if (dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      };
    }

    return config;
  },
}

module.exports = nextConfig
