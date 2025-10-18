import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const locales = ['en', 'el'];
  if (!locales.includes(locale)) notFound();

  // Load all message files for the locale
  const messages = {
    ...((await import(`@/messages/${locale}/common.json`)).default),
    dashboard: (await import(`@/messages/${locale}/dashboard.json`)).default,
    properties: (await import(`@/messages/${locale}/properties.json`)).default,
    relations: (await import(`@/messages/${locale}/relations.json`)).default,
    oikosync: (await import(`@/messages/${locale}/oikosync.json`)).default,
    members: (await import(`@/messages/${locale}/members.json`)).default,
    billing: (await import(`@/messages/${locale}/billing.json`)).default,
    settings: (await import(`@/messages/${locale}/settings.json`)).default,
    navigation: (await import(`@/messages/${locale}/navigation.json`)).default,
    validation: (await import(`@/messages/${locale}/validation.json`)).default,
    errors: (await import(`@/messages/${locale}/errors.json`)).default,
  };

  return {
    messages,
    timeZone: 'Europe/Athens', // Default timezone for Greece
    now: new Date(),
  };
});
