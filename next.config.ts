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
  async redirects() {
    return [
      {
        source: '/our-blog',
        destination: '/articles',
        permanent: true,
      },
      {
        source: '/our-blog/',
        destination: '/articles',
        permanent: true,
      },
      {
        source: '/about-us',
        destination: '/',
        permanent: true,
      },
      {
        source: '/about-us/',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
