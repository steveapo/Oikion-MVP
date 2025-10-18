/**
 * Centralized routing configuration for next-intl
 * 
 * This configuration is shared across:
 * - next.config.js (plugin configuration)
 * - middleware.ts (routing middleware)
 * - i18n/navigation.ts (Link and router utilities)
 * 
 * CRITICAL: All three must use the SAME configuration to avoid routing mismatches.
 */

import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: locales,
  
  // Used when no locale matches
  defaultLocale: defaultLocale,
  
  // CRITICAL: 'as-needed' means default locale (en) has NO prefix
  // - English: / (no prefix)
  // - Greek: /el/ (prefixed)
  localePrefix: 'as-needed',
  
  // Disable automatic locale detection (we control it manually)
  localeDetection: false
});

// Type exports for use in other files
export type Locale = (typeof locales)[number];
