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
    ],
  },
};

export default nextConfig;
