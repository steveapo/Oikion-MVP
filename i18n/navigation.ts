/**
 * Next-intl navigation wrappers
 * 
 * This file creates locale-aware navigation components and utilities
 * using the centralized routing configuration.
 * 
 * CRITICAL: This uses the same routing config as middleware.ts and next.config.js
 * to ensure consistent URL generation across the app.
 * 
 * All Link components and navigation hooks should be imported from this file
 * instead of from 'next/link' or 'next/navigation' to ensure proper locale routing.
 */

import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Create navigation utilities with the centralized routing config
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
