/**
 * Next-intl navigation wrappers
 * 
 * This file creates locale-aware navigation components and utilities
 * using next-intl's createSharedPathnamesNavigation.
 * 
 * All Link components and navigation hooks should be imported from this file
 * instead of from 'next/link' or 'next/navigation' to ensure proper locale routing.
 */

import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from './config';

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix: 'as-needed' });
