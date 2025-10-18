// Shared i18n configuration that can be imported across the app
export const locales = ['en', 'el'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  el: 'Ελληνικά',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  el: '🇬🇷',
};
