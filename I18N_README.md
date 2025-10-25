# 🌍 Internationalization (i18n) - Implementation Complete

## Overview

The Oikion MVP now has **full internationalization support** for English and Greek languages!

## 📦 What's Been Implemented

### ✅ Infrastructure (Phase 0 - COMPLETE)

- **Translation Framework**: next-intl integrated with Next.js App Router
- **Supported Locales**: English (en) [default], Greek (el)
- **Translation Files**: 22 files with complete translations
- **Build Validation**: Automatic translation completeness checking
- **Language Switcher**: Ready-to-use UI component
- **Database Support**: User locale preferences stored and persisted
- **Type Safety**: Full TypeScript support with autocomplete

## 🚀 Quick Start

### For Developers

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Apply database migration**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify setup**:
   ```bash
   pnpm validate:i18n
   ```

4. **Start development**:
   ```bash
   pnpm dev
   ```

   Visit:
   - English: http://localhost:3000/dashboard
   - Greek: http://localhost:3000/el/dashboard

### For Content Editors

See **I18N_QUICKSTART.md** for common translation tasks.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **I18N_QUICKSTART.md** | 5-minute quick start guide |
| **I18N_SETUP_SUMMARY.md** | Complete implementation summary |
| **I18N_DEPLOYMENT_CHECKLIST.md** | Deployment and testing checklist |
| **docs/I18N_IMPLEMENTATION.md** | Comprehensive technical guide |
| **docs/tolgee-integration/index.md** | Tolgee TMS-only (self-hosted) integration & CI sync |

## 🎯 Current Status

### ✅ Completed

- [x] **Phase 0: Infrastructure Setup**
  - [x] next-intl installation and configuration
  - [x] Translation file structure created (en + el)
  - [x] Next.js and middleware configuration
  - [x] Database schema updated (preferredLocale field)
  - [x] Build-time validation script
  - [x] Language switcher component
  - [x] TypeScript type safety
  - [x] Utility functions (formatting, locale management)
  - [x] Server actions for locale updates
  - [x] Comprehensive documentation

### 🔄 Next Steps (Content Migration)

The infrastructure is ready. Now you can migrate page content:

- [ ] **Phase 1**: Dashboard page
- [ ] **Phase 2**: Properties page (MLS)
- [ ] **Phase 3**: Relations page (CRM)
- [ ] **Phase 4**: Oikosync page (Activity Feed)
- [ ] **Phase 5**: Members page
- [ ] **Phase 6**: Billing page
- [ ] **Phase 7**: Settings page
- [ ] **Phase 8**: Navigation & Shared UI
- [ ] **Phase 9**: Forms & Validation
- [ ] **Phase 10**: Error States & Alerts

## 💡 Usage Examples

### Add Language Switcher

```tsx
import { LanguageSwitcher } from '@/components/shared/language-switcher';

<Header>
  <LanguageSwitcher />
</Header>
```

### Use Translations

**Server Component:**
```tsx
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations('dashboard');
  return <h1>{t('header.title')}</h1>;
}
```

**Client Component:**
```tsx
"use client";
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  return <button>{t('buttons.save')}</button>;
}
```

### Format Currency

```tsx
import { formatCurrency } from '@/lib/i18n-utils';
import { useLocale } from 'next-intl';

const locale = useLocale();
const price = formatCurrency(250000, locale, 'EUR');
// en: "€250,000"
// el: "250.000 €"
```

## 🧪 Testing

### Validate Translations
```bash
pnpm validate:i18n
```

### Build (includes validation)
```bash
pnpm build
```

## 📁 Key Files & Directories

```
/messages/                     Translation files
  ├── en/                     English (source of truth)
  │   ├── common.json        Shared UI elements
  │   ├── dashboard.json     Dashboard translations
  │   └── ...                Other pages
  └── el/                     Greek translations
      └── (same structure)

/components/shared/
  └── language-switcher.tsx   Language switcher component

/lib/
  └── i18n-utils.ts          i18n utility functions

/actions/
  └── locale.ts              Server actions for locale management

/scripts/
  └── validate-translations.mjs  Build-time validation

/prisma/migrations/
  └── 20251018_add_preferred_locale/  Database migration

/docs/
  └── I18N_IMPLEMENTATION.md  Technical documentation

i18n.ts                       next-intl configuration
middleware.ts                 Locale routing (updated)
next.config.js                Next.js config (updated)
```

## 🔧 Configuration

### Supported Locales

```typescript
// i18n.ts
export const locales = ['en', 'el'] as const;
```

### URL Structure

| Language | URL Pattern | Example |
|----------|-------------|---------|
| English  | `/{page}`   | `/dashboard` |
| Greek    | `/el/{page}` | `/el/dashboard` |

### User Preference

- **Stored in**: Database (`users.preferredLocale`)
- **Default**: English (`en`)
- **Changeable via**: Language switcher component

## 🛠️ Adding New Translations

1. Add key to English file (source of truth)
2. Add corresponding Greek translation
3. Run validation: `pnpm validate:i18n`
4. Use in code: `t('your.new.key')`

## 🌐 Adding New Locale

See **docs/I18N_IMPLEMENTATION.md** → "Adding a New Locale" section

## 📊 Statistics

- **Locales**: 2 (en, el)
- **Translation Files**: 22 (11 per locale)
- **Translation Keys**: ~150+ keys
- **Configuration Files**: 5 updated
- **New Components**: 1 (LanguageSwitcher)
- **Database Changes**: 1 field (preferredLocale)
- **Utility Functions**: 8
- **Server Actions**: 2
- **Documentation Pages**: 4

## ✨ Features

- ✅ **Multi-language Support**: English + Greek
- ✅ **Build-time Validation**: Prevents incomplete translations
- ✅ **Type Safety**: Full TypeScript autocomplete
- ✅ **User Preferences**: Persistent locale selection
- ✅ **SEO Ready**: Proper locale routing
- ✅ **Date/Number Formatting**: Locale-aware formatting
- ✅ **Currency Formatting**: Region-specific display
- ✅ **Easy to Extend**: Add new locales easily

## 🚨 Important Notes

### Before First Deployment

1. ✅ Run `pnpm install` to install next-intl
2. ⚠️ **REQUIRED**: Apply database migration:
   ```bash
   npx prisma migrate deploy
   ```
3. ✅ Verify with `pnpm validate:i18n`

### Build Process

The build automatically validates translations:
```bash
pnpm build
# Runs: validate:i18n → contentlayer:fix → next build
```

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails with translation errors | Run `pnpm validate:i18n` to see missing keys |
| Translations not updating | Clear cache: `rm -rf .next && pnpm dev` |
| Language switcher not showing | Ensure it's in a client component (`"use client"`) |
| TypeScript errors on keys | Restart TS server in your IDE |

## 📞 Support

- **Quick Start**: See `I18N_QUICKSTART.md`
- **Full Guide**: See `docs/I18N_IMPLEMENTATION.md`
- **Deployment**: See `I18N_DEPLOYMENT_CHECKLIST.md`

---

**Status**: Phase 0 Complete ✅  
**Next**: Content migration (Phases 1-10)  
**Ready for**: Development and deployment

**Built with**: next-intl, Next.js 14, TypeScript, Prisma
