/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Vercel serverless function configuration
  experimental: {
    serverComponentsExternalPackages: ['crypto-js'],
  },
}

module.exports = nextConfig
