const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');

// Setup Cloudflare dev platform for local development
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use standalone for Docker builds, not Cloudflare
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
}

module.exports = nextConfig