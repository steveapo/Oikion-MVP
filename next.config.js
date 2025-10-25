const { withContentlayer } = require("next-contentlayer2");
const FixContentlayerTypesPlugin = require("./lib/fix-contentlayer-types-plugin");
const withNextIntl = require('next-intl/plugin')('./i18n/request.ts', {
  locales: ['en', 'el'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable tree-shaking and code splitting
  modularizeImports: {
    // Optimize lucide-react imports (tree-shake unused icons)
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
    // Optimize @radix-ui imports (tree-shake unused components)
    '@radix-ui/react-accordion': {
      transform: '@radix-ui/react-accordion/dist/{{member}}',
    },
    '@radix-ui/react-alert-dialog': {
      transform: '@radix-ui/react-alert-dialog/dist/{{member}}',
    },
    '@radix-ui/react-avatar': {
      transform: '@radix-ui/react-avatar/dist/{{member}}',
    },
    '@radix-ui/react-checkbox': {
      transform: '@radix-ui/react-checkbox/dist/{{member}}',
    },
    '@radix-ui/react-dialog': {
      transform: '@radix-ui/react-dialog/dist/{{member}}',
    },
    '@radix-ui/react-dropdown-menu': {
      transform: '@radix-ui/react-dropdown-menu/dist/{{member}}',
    },
    '@radix-ui/react-label': {
      transform: '@radix-ui/react-label/dist/{{member}}',
    },
    '@radix-ui/react-popover': {
      transform: '@radix-ui/react-popover/dist/{{member}}',
    },
    '@radix-ui/react-select': {
      transform: '@radix-ui/react-select/dist/{{member}}',
    },
    '@radix-ui/react-separator': {
      transform: '@radix-ui/react-separator/dist/{{member}}',
    },
    '@radix-ui/react-slider': {
      transform: '@radix-ui/react-slider/dist/{{member}}',
    },
    '@radix-ui/react-switch': {
      transform: '@radix-ui/react-switch/dist/{{member}}',
    },
    '@radix-ui/react-tabs': {
      transform: '@radix-ui/react-tabs/dist/{{member}}',
    },
    '@radix-ui/react-toast': {
      transform: '@radix-ui/react-toast/dist/{{member}}',
    },
    '@radix-ui/react-tooltip': {
      transform: '@radix-ui/react-tooltip/dist/{{member}}',
    },
    // Optimize recharts (tree-shake unused chart components)
    'recharts': {
      transform: 'recharts/esm/{{member}}',
    },
    // Optimize date-fns (tree-shake unused date functions)
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
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
    // Enable optimized package imports
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'recharts',
      'date-fns',
    ],
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.plugins.push(new FixContentlayerTypesPlugin());
    }

    // Optimize bundle splitting for better caching
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Separate chunk for UI components (shadcn/ui)
          ui: {
            name: 'ui',
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          // Separate chunk for icons
          icons: {
            name: 'icons',
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          // Separate chunk for charts
          charts: {
            name: 'charts',
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          // Separate chunk for Stripe (only load when needed)
          stripe: {
            name: 'stripe',
            test: /[\\/]node_modules[\\/]stripe[\\/]/,
            chunks: 'async',
            priority: 10,
          },
          // Separate chunk for date utilities
          dateUtils: {
            name: 'date-utils',
            test: /[\\/]node_modules[\\/]date-fns[\\/]/,
            chunks: 'all',
            priority: 15,
          },
          // Default vendor chunk for other libraries
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 5,
          },
        },
      };
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(withNextIntl(withContentlayer(nextConfig)));
