import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.32beatwriters.staging.pegasync.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'api.32beatwriters.staging.pegasync.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'www.playerprofiler.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
