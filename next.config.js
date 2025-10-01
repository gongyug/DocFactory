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

  // Webpack configuration for Edge Runtime
  webpack: (config, { webpack }) => {
    // Ignore @cloudflare/puppeteer during build to avoid Node.js module issues
    // It will be loaded dynamically at runtime in Cloudflare environment
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /@cloudflare\/puppeteer/,
      })
    );

    return config;
  },
}

module.exports = nextConfig