/**
 * @file next.config.mjs
 * @description Next.js configuration. Sets standalone output target, configures file watcher options for HMR,
 * and maps subpaths internally to the root route to prevent 404s on browser reloads while supporting analytics tracking.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    return [
      { source: "/emotions", destination: "/" },
      { source: "/who_starts", destination: "/" },
      { source: "/locations", destination: "/" },
      { source: "/eras", destination: "/" },
      { source: "/timer", destination: "/" },
      { source: "/constraints", destination: "/" },
      { source: "/docs", destination: "/" },
      { source: "/hiha", destination: "/" },
    ];
  },
  // Allow running inside docker HMR with specific web socket port/host if needed
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
