/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['assets-v2.scaler.com', 'drive.google.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/thumbnail/**',
      },
      {
        protocol: 'https',
        hostname: 'assets-v2.scaler.com',
        pathname: '/assets/**',
      }
    ]
  }
}

module.exports = nextConfig
