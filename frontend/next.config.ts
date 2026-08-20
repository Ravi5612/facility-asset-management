import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  /* config options here */
  async redirects() {
    return [
      {
        source: '/dashboard/:path*',
        destination: '/superadmin/:path*',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/superadmin',
        permanent: true,
      },
      {
        source: '/hod',
        destination: '/login', // Force login if they just hit /hod
        permanent: true,
      },
      {
        source: '/hod/dashboard',
        destination: '/login', // They must login to get the right dept slug
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
