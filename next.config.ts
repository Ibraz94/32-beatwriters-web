import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'beatwriters.s3.us-east-2.amazonaws.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'www.playerprofiler.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'api.32beatwriters.staging.pegasync.com',
        port: '',
      }
    ],
  },
};

export default nextConfig;
