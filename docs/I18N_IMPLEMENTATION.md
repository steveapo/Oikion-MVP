# Internationalization (i18n) Implementation Guide

## Overview

This document provides a complete guide to the internationalization implementation in Oikion MVP. The application supports multiple languages with English (en) as the default and Greek (el) as the primary additional locale.

## Architecture

### Technology Stack

- **Library**: `next-intl` - Built specifically for Next.js App Router with RSC support
- **Locales**: English (`en`), Greek (`el`)
- **Default Locale**: English (`en`)
- **URL Structure**: 
  - English: `/dashboard` (no prefix)
  - Greek: `/el/dashboard`

### Folder Structure

```
/messages
├── en/                    # English translations (source of truth)
│   ├── common.json       # Shared UI elements
│   ├── dashboard.json    # Dashboard page
│   ├── properties.json   # Properties/MLS page
│   ├── relations.json    # Relations/CRM page
│   ├── oikosync.json     # Oikosync/Activity Feed
│   ├── members.json      # Members page
│   ├── billing.json      # Billing page
│   ├── settings.json     # Settings page
│   ├── navigation.json   # Navigation menus
│   ├── validation.json   # Form validation messages
│   └── errors.json       # Error messages
└── el/                    # Greek translations
    └── (same structure)
```

## Setup Instructions

### 1. Install Dependencies

After cloning the repository, install the required packages:

```bash
pnpm install
```

This will install `next-intl` and all other dependencies.

### 2. Database Migration

Add the `preferredLocale` field to the User model:

```bash
npx prisma migrate dev --name add_preferred_locale
```

### 3. Environment Setup

No additional environment variables are required for i18n. The configuration uses the existing database and authentication setup.

## Usage Guide

### Using Translations in Server Components

```tsx
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  
  return (
    <div>
      <h1>{t('header.title')}</h1>
      <p>{t('header.description', { role: 'Admin' })}</p>
    </div>
  );
}
```

### Using Translations in Client Components

```tsx
"use client";

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  
  return (
    <button>{t('buttons.save')}</button>
  );
}
```

### Variable Interpolation

```json
{
  "greeting": "Hello, {{name}}!"
}
```

```tsx
t('greeting', { name: user.name })
// Output: "Hello, John!"
```

### Pluralization

```json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}
```

```tsx
t('items', { count: 1 })  // "1 item"
t('items', { count: 5 })  // "5 items"
```

### Formatting Utilities

#### Date Formatting

```tsx
import { formatDate } from '@/lib/i18n-utils';
import { useLocale } from 'next-intl';

const locale = useLocale();
const formattedDate = formatDate(new Date(), locale);
```

#### Currency Formatting

```tsx
import { formatCurrency } from '@/lib/i18n-utils';
import { useLocale } from 'next-intl';

const locale = useLocale();
const price = formatCurrency(250000, locale, 'EUR');
// en: "€250,000"
// el: "250.000 €"
```

## Adding Translations

### Step-by-Step Workflow

1. **Add English translation** (source of truth):
   ```json
   // messages/en/dashboard.json
   {
     "newFeature": {
       "title": "New Feature",
       "description": "This is a new feature"
     }
   }
   ```

2. **Add Greek translation**:
   ```json
   // messages/el/dashboard.json
   {
     "newFeature": {
       "title": "Νέο Χαρακτηριστικό",
       "description": "Αυτό είναι ένα νέο χαρακτηριστικό"
     }
   }
   ```

3. **Use in component**:
   ```tsx
   const t = useTranslations('dashboard');
   <h2>{t('newFeature.title')}</h2>
   ```

4. **Validate translations**:
   ```bash
   pnpm validate:i18n
   ```

## Build-Time Validation

### Validation Script

The project includes a comprehensive validation script that runs before every build:

```bash
pnpm validate:i18n
```

### What It Checks

- ✅ All English keys exist in Greek translations
- ✅ No empty translation values
- ✅ Variable interpolation consistency (`{{varName}}`)
- ⚠️ Extra keys in translations (warnings only)
- ⚠️ Missing or extra variables in translations

### Example Output

```
🌍 Validating translations...

Checking locale: el
  ✓ common.json
  ✓ dashboard.json
  ✗ properties.json - 2 error(s)
  
❌ Errors in el/properties.json:
   • Missing key: filters.bedrooms
   • Empty value for key: card.viewDetails

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary:
  • Locales validated: 1 (excluding en)
  • Critical pages: 11
  • Total checks: 11
  • Errors: 2
  • Warnings: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Translation validation failed!
Build aborted. Please fix the errors above.
```

## Language Switcher Component

### Integration

Add the language switcher to your layout or navigation:

```tsx
import { LanguageSwitcher } from '@/components/shared/language-switcher';

export function Header() {
  return (
    <header>
      {/* Other header content */}
      <LanguageSwitcher />
    </header>
  );
}
```

### Features

- 🌐 Dropdown with all available locales
- 🎌 Flag icons for visual identification
- ✓ Check mark on current locale
- 💾 Saves preference to user profile
- 🔄 Updates URL and refreshes page

## Server Actions

### Update User Locale

```tsx
import { updateUserLocale } from '@/actions/locale';

// In a server action or API route
const result = await updateUserLocale('el', '/dashboard');

if (result.success) {
  // Locale updated successfully
}
```

### Get User Preferred Locale

```tsx
import { getUserPreferredLocale } from '@/actions/locale';

const locale = await getUserPreferredLocale();
// Returns: 'en' | 'el' | null
```

## Middleware Configuration

The middleware handles:

1. **Locale Detection**: From URL, user preference, or browser headers
2. **Routing**: Automatically adds/removes locale prefix
3. **Session Persistence**: Maintains locale across navigation

### How It Works

```
User visits: /dashboard
↓
Middleware checks:
  1. URL locale prefix? No
  2. User preference in DB? Greek (el)
  3. Browser Accept-Language? en-US
↓
Decision: Use user preference (el)
↓
Redirect to: /el/dashboard
```

## TypeScript Support

### Type-Safe Translation Keys

TypeScript will autocomplete and validate all translation keys:

```tsx
const t = useTranslations('dashboard');

t('header.title')      // ✅ Valid
t('header.typo')       // ❌ Type error: Property 'typo' does not exist
```

### Locale Type

```tsx
import { type Locale } from '@/lib/i18n-utils';

function MyComponent({ locale }: { locale: Locale }) {
  // locale is type-safe: 'en' | 'el'
}
```

## Testing Translations

### Manual Testing Checklist

- [ ] Switch language via language switcher
- [ ] Verify URL updates correctly
- [ ] Check all page content translates
- [ ] Test with user who has no locale preference
- [ ] Test with direct URL access (e.g., `/el/dashboard`)
- [ ] Verify date/number formatting per locale
- [ ] Check form validation messages
- [ ] Test error pages (404, 500)

### Automated Testing

```bash
# Validate all translations
pnpm validate:i18n

# Run build (includes validation)
pnpm build
```

## Adding a New Locale

### Step-by-Step Process

1. **Update locale configuration**:
   ```ts
   // i18n.ts
   export const locales = ['en', 'el', 'es'] as const; // Add 'es'
   ```

2. **Create translation folder**:
   ```bash
   mkdir messages/es
   ```

3. **Copy English files**:
   ```bash
   cp messages/en/*.json messages/es/
   ```

4. **Translate content**:
   - Edit each `.json` file in `messages/es/`
   - Maintain the same key structure

5. **Update utilities**:
   ```ts
   // lib/i18n-utils.ts
   export function getLocaleDisplayName(locale: Locale): string {
     const displayNames: Record<Locale, string> = {
       en: 'English',
       el: 'Ελληνικά',
       es: 'Español' // Add new locale
     };
     return displayNames[locale];
   }
   ```

6. **Update i18n config**:
   ```ts
   // i18n.ts - add new locale imports
   es: (await import(`./messages/es/...`)).default,
   ```

7. **Validate**:
   ```bash
   pnpm validate:i18n
   ```

## Best Practices

### 1. Translation Key Naming

- ✅ Use descriptive, hierarchical keys: `dashboard.header.title`
- ❌ Avoid flat keys: `dashboardTitle`
- ✅ Group related translations: `buttons.save`, `buttons.cancel`
- ❌ Don't scatter related keys: `saveBtn`, `cancelButton`

### 2. Translation Values

- ✅ Keep sentences complete: "Click here to continue"
- ❌ Don't split sentences: "Click" + " here " + "to continue"
- ✅ Use variables for dynamic content: "Hello, {{name}}"
- ❌ Don't concatenate strings: "Hello, " + name

### 3. Variable Consistency

- ✅ Use same variable names in all locales: `{{count}}`
- ❌ Don't change variable names: `{{count}}` vs `{{numero}}`

### 4. Context

- ✅ Provide context in key names: `forms.login.submit`
- ❌ Generic keys lose context: `submit`

### 5. Pluralization

- ✅ Use plural forms: `items`, `items_plural`
- ✅ Consider zero cases: `items_zero`, `items`, `items_plural`

## Troubleshooting

### Issue: Translations not updating

**Solution**: Clear Next.js cache and rebuild
```bash
rm -rf .next
pnpm build
```

### Issue: Build fails with translation errors

**Solution**: Run validation to see missing keys
```bash
pnpm validate:i18n
```

### Issue: Language switcher not appearing

**Solution**: Ensure component is imported in client component
```tsx
"use client"; // Must be at top of file
import { LanguageSwitcher } from '@/components/shared/language-switcher';
```

### Issue: Type errors with translation keys

**Solution**: Restart TypeScript server
```
VSCode: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## Migration Status

### ✅ Phase 0: Infrastructure (Complete)
- [x] Install next-intl
- [x] Create message folder structure
- [x] Configure Next.js and middleware
- [x] Add preferredLocale to User model
- [x] Create validation script
- [x] Implement language switcher

### 🔄 Pending Phases
- [ ] Phase 1: Dashboard Page
- [ ] Phase 2: Properties Page
- [ ] Phase 3: Relations Page
- [ ] Phase 4: Oikosync Page
- [ ] Phase 5: Members Page
- [ ] Phase 6: Billing Page
- [ ] Phase 7: Settings Page
- [ ] Phase 8: Navigation & Shared UI
- [ ] Phase 9: Forms & Validation
- [ ] Phase 10: Error States & Alerts

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Greek Language Code (ISO 639-1)](https://en.wikipedia.org/wiki/ISO_639-1)

## Support

For questions or issues with i18n implementation:
1. Check this documentation
2. Run `pnpm validate:i18n` to identify translation issues
3. Review console errors for missing translation keys
4. Consult next-intl documentation for advanced features
