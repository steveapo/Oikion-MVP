import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // Wait for the locale from the middleware
  let locale = await requestLocale;
  
  // Validate that the incoming locale is valid
  const locales = ['en', 'el'];
  if (!locale || !locales.includes(locale)) {
    const cookieLocale = cookies().get('NEXT_LOCALE')?.value;
    if (cookieLocale && locales.includes(cookieLocale)) {
      locale = cookieLocale;
    } else {
      locale = 'en';
    }
  }

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
    // Marketing pages
    home: (await import(`@/messages/${locale}/home.json`)).default,
    pricing: (await import(`@/messages/${locale}/pricing.json`)).default,
    blog: (await import(`@/messages/${locale}/blog.json`)).default,
  };

  return {
    locale,  // CRITICAL: Must return locale
    messages,
    timeZone: 'Europe/Athens', // Default timezone for Greece
    now: new Date(),
  };
});
