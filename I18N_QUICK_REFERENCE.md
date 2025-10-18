# 🚀 i18n Quick Reference - Updated Configuration

**Last Updated**: 2025-01-XX  
**Status**: ✅ Production Ready

---

## 📌 Quick Import Reference

### ✅ Navigation (Most Common)

```typescript
// Use this for all app navigation
import { Link, useRouter, usePathname, redirect } from '@/i18n/navigation';
```

### ✅ Configuration & Types

```typescript
// Use this for locale constants and types
import { locales, type Locale, localeNames, localeFlags } from '@/i18n/config';
```

### ✅ Utilities

```typescript
// Use this for helper functions
import { getLocaleDisplayName, getLocaleFlag, formatCurrency } from '@/lib/i18n-utils';
```

---

## 🎯 Common Patterns

### 1. Creating a Link

```typescript
import { Link } from '@/i18n/navigation';

// ✅ Link automatically respects current locale
<Link href="/dashboard">Dashboard</Link>
<Link href="/dashboard/properties">Properties</Link>
```

### 2. Programmatic Navigation

```typescript
import { useRouter } from '@/i18n/navigation';

function MyComponent() {
  const router = useRouter();
  
  // Navigate within current locale
  const handleClick = () => {
    router.push('/dashboard/properties');
  };
  
  return <button onClick={handleClick}>Go to Properties</button>;
}
```

### 3. Changing Language

```typescript
import { useRouter, usePathname } from '@/i18n/navigation';

function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  
  const switchToGreek = () => {
    router.replace(pathname, { locale: 'el' });
  };
  
  return <button onClick={switchToGreek}>Ελληνικά</button>;
}
```

### 4. Getting Current Path

```typescript
import { usePathname } from '@/i18n/navigation';

function MyComponent() {
  const pathname = usePathname();
  // pathname is WITHOUT locale prefix
  // e.g., "/dashboard" not "/el/dashboard"
  
  return <div>Current page: {pathname}</div>;
}
```

### 5. Server-Side Redirect

```typescript
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function Page() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login'); // Automatically includes locale
  }
  
  return <div>Protected content</div>;
}
```

---

## 📂 File Structure

```
i18n/
├── config.ts       → Shared constants (locales, names, flags)
├── request.ts      → Server request configuration
└── navigation.ts   → Locale-aware Link, useRouter, etc.

lib/
└── i18n-utils.ts   → Helper functions

messages/
├── en/             → English translations
│   ├── common.json
│   ├── dashboard.json
│   └── ...
└── el/             → Greek translations
    ├── common.json
    ├── dashboard.json
    └── ...
```

---

## ⚠️ Do Not Import From

```typescript
// ❌ DEPRECATED - Don't use
import { locales } from '@/i18n';

// ❌ WRONG - Don't use for app navigation
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ✅ CORRECT
import { locales } from '@/i18n/config';
import { Link, useRouter } from '@/i18n/navigation';
```

---

## 🔧 Available Exports

### From `@/i18n/config`
- `locales` - Array of supported locales: `['en', 'el']`
- `type Locale` - TypeScript type for locales
- `defaultLocale` - The default locale: `'en'`
- `localeNames` - Display names: `{ en: 'English', el: 'Ελληνικά' }`
- `localeFlags` - Flag emojis: `{ en: '🇬🇧', el: '🇬🇷' }`

### From `@/i18n/navigation`
- `Link` - Locale-aware Link component
- `useRouter` - Locale-aware router hook
- `usePathname` - Get current pathname (without locale)
- `redirect` - Server-side redirect

### From `@/lib/i18n-utils`
- `isValidLocale(locale: string)` - Check if locale is valid
- `getDefaultLocale()` - Get default locale
- `getLocaleDisplayName(locale: Locale)` - Get display name
- `getLocaleFlag(locale: Locale)` - Get flag emoji
- `formatDate(date: Date, locale: Locale)` - Format date
- `formatNumber(num: number, locale: Locale)` - Format number
- `formatCurrency(amount: number, locale: Locale)` - Format currency
- `getUserLocale(preferredLocale?: string)` - Get user's locale

---

## 🎨 Example: Complete Language Switcher

```typescript
'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { locales, getLocaleDisplayName, getLocaleFlag } from '@/i18n/config';
import { updateUserLocale } from '@/actions/locale';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    startTransition(async () => {
      // Save to database
      await updateUserLocale(newLocale, pathname);
      
      // Update URL
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <select
      value={currentLocale}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {getLocaleFlag(locale)} {getLocaleDisplayName(locale)}
        </option>
      ))}
    </select>
  );
}
```

---

## 🔍 Troubleshooting

### Issue: 404 on navigation
**Cause**: Using regular `Link` from `next/link`  
**Fix**: Import from `@/i18n/navigation`

### Issue: Locale not changing
**Cause**: Using `router.push()` without locale parameter  
**Fix**: Use `router.replace(pathname, { locale: 'el' })`

### Issue: TypeScript errors on import
**Cause**: Importing from deprecated `@/i18n`  
**Fix**: Import from `@/i18n/config`

---

## 📚 Further Reading

- [Next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Migration Guide](./I18N_MIGRATION_COMPLETE.md)
- [Complete Implementation](./I18N_IMPLEMENTATION_COMPLETE.md)

---

**Need Help?** Check `I18N_MIGRATION_COMPLETE.md` for detailed migration information.
