const { withContentlayer } = require("next-contentlayer2");
const FixContentlayerTypesPlugin = require("./lib/fix-contentlayer-types-plugin");

import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(new FixContentlayerTypesPlugin());
    }
    return config;
  },
};

module.exports = withContentlayer(nextConfig);
