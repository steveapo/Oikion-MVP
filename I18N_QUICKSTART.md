# i18n Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Apply Database Migration
```bash
npx prisma migrate deploy
```

### 3. Verify Setup
```bash
pnpm validate:i18n
```

Expected output: ✅ All translations validated successfully

---

## 💡 Common Use Cases

### Add Language Switcher to Your Page

```tsx
import { LanguageSwitcher } from '@/components/shared/language-switcher';

export function MyPage() {
  return (
    <div>
      <LanguageSwitcher />
      {/* Your content */}
    </div>
  );
}
```

---

### Use Translations in Server Component

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

---

### Use Translations in Client Component

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

---

### Format Currency by Locale

```tsx
import { formatCurrency } from '@/lib/i18n-utils';
import { useLocale } from 'next-intl';

export function PriceDisplay({ amount }: { amount: number }) {
  const locale = useLocale();
  
  return (
    <span>{formatCurrency(amount, locale, 'EUR')}</span>
  );
}
```

---

### Add New Translation Keys

1. **Add to English** (source of truth):
   ```json
   // messages/en/dashboard.json
   {
     "myNewKey": "My New Text"
   }
   ```

2. **Add to Greek**:
   ```json
   // messages/el/dashboard.json
   {
     "myNewKey": "Το Νέο Μου Κείμενο"
   }
   ```

3. **Use in code**:
   ```tsx
   const t = useTranslations('dashboard');
   <p>{t('myNewKey')}</p>
   ```

4. **Validate**:
   ```bash
   pnpm validate:i18n
   ```

---

### Update User's Language Preference

```tsx
import { updateUserLocale } from '@/actions/locale';

// In an async function or server action
const result = await updateUserLocale('el');
```

---

## 🧪 Test Your Changes

```bash
# Validate translations
pnpm validate:i18n

# Build (includes validation)
pnpm build

# Start dev server
pnpm dev
```

Visit:
- English: `http://localhost:3000/dashboard`
- Greek: `http://localhost:3000/el/dashboard`

---

## 📋 Translation Files Reference

| File | Purpose |
|------|---------|
| `common.json` | Buttons, labels, shared UI |
| `dashboard.json` | Dashboard page |
| `properties.json` | Properties/MLS page |
| `relations.json` | Relations/CRM page |
| `oikosync.json` | Activity feed |
| `members.json` | Team management |
| `billing.json` | Subscription/billing |
| `settings.json` | Settings page |
| `navigation.json` | Menus, navigation |
| `validation.json` | Form validation |
| `errors.json` | Error messages |

---

## 🐛 Quick Troubleshooting

**Build fails with translation errors?**
```bash
pnpm validate:i18n  # See what's missing
```

**Translations not updating?**
```bash
rm -rf .next && pnpm dev
```

**TypeScript errors on translation keys?**
- Restart TS server in your IDE
- VSCode: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

---

## 📖 Full Documentation

See `docs/I18N_IMPLEMENTATION.md` for comprehensive guide.

---

**Happy translating! 🌍**
