/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Let astronomy-engine resolve from node_modules at runtime instead of
  // being bundled by Webpack — it uses native ESM that the bundler can
  // mishandle inside server-side API routes.
  serverExternalPackages: ['astronomy-engine'],
};

module.exports = nextConfig;
