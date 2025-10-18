/**
 * Internationalization utilities
 * 
 * Provides helper functions for locale management, translation loading,
 * and language switching throughout the application.
 */

import { locales, type Locale } from '@/i18n';

export type { Locale };
export { locales };

/**
 * Check if a locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get the default locale
 */
export function getDefaultLocale(): Locale {
  return 'en';
}

/**
 * Get locale display name
 */
export function getLocaleDisplayName(locale: Locale): string {
  const displayNames: Record<Locale, string> = {
    en: 'English',
    el: 'Ελληνικά'
  };
  
  return displayNames[locale];
}

/**
 * Get locale flag emoji
 */
export function getLocaleFlag(locale: Locale): string {
  const flags: Record<Locale, string> = {
    en: '🇬🇧',
    el: '🇬🇷'
  };
  
  return flags[locale];
}

/**
 * Format a date according to locale
 */
export function formatDate(date: Date, locale: Locale): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Format a number according to locale
 */
export function formatNumber(num: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(amount: number, locale: Locale, currency = 'EUR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Get locale from user preference or default
 */
export function getUserLocale(userPreferredLocale?: string | null): Locale {
  if (userPreferredLocale && isValidLocale(userPreferredLocale)) {
    return userPreferredLocale;
  }
  return getDefaultLocale();
}
