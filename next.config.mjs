/**
 * @file next.config.mjs
 * @description Next.js configuration. Sets standalone output target, configures file watcher options for HMR,
 * and maps subpaths internally to the root route to prevent 404s on browser reloads while supporting analytics tracking.
 * @author Éole <hi@eole>
 * @creation-date $Creation Date$
 * @license MIT
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    return [
      { source: "/index.html", destination: "/" },
      {
        source: "/:path((?!_next|api|data|manifest\\.json|sw\\.js|favicon\\.svg|icon\\.svg).*$)",
        destination: "/",
      },
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
