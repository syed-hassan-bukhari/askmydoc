/** @type {import('next').NextConfig} */
const nextConfig = {
  // We removed the 'experimental' block because Server Actions are now default.
  
  // This keeps the fix for the missing canvas library
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig