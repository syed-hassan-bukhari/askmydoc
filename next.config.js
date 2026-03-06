/** @type {import('next').NextConfig} */
const nextConfig = {
  // Empty turbopack config — silences the Turbopack/webpack mismatch error on Vercel (Next.js 16)
  turbopack: {},

  // Keeps the canvas alias fix for pdf-parse
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig