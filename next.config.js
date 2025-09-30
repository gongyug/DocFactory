/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use standalone for Docker builds, not Vercel
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Tell Next.js not to bundle these packages (Vercel needs them external)
    serverComponentsExternalPackages: ['@sparticuz/chromium'],
  },
}

module.exports = nextConfig