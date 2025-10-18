# i18n Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│  User visits: /dashboard or /el/dashboard                      │
│                                                                 │
│  ┌──────────────────┐                                          │
│  │ Language Switcher│  (Client Component)                      │
│  │   🇬🇧  EN  ✓    │                                          │
│  │   🇬🇷  ΕΛ       │                                          │
│  └──────────────────┘                                          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                         MIDDLEWARE                              │
│                      (Edge Runtime)                             │
│                                                                 │
│  1. Detect Locale:                                             │
│     ├─ URL prefix? (/el/...)                                   │
│     ├─ User preference? (from DB)                              │
│     └─ Browser header? (Accept-Language)                       │
│                                                                 │
│  2. Route to correct locale                                    │
│                                                                 │
│  3. Set Next-Locale header                                     │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP ROUTER                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              Server Component                        │     │
│  │                                                      │     │
│  │  import { useTranslations } from 'next-intl'        │     │
│  │  const t = useTranslations('dashboard')             │     │
│  │                                                      │     │
│  │  return <h1>{t('header.title')}</h1>                │     │
│  └──────────────────────────────────────────────────────┘     │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              i18n Configuration                      │     │
│  │              (i18n.ts)                               │     │
│  │                                                      │     │
│  │  1. Validate locale                                 │     │
│  │  2. Load translation files                          │     │
│  │  3. Return messages object                          │     │
│  └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSLATION FILES                            │
│                                                                 │
│  /messages                                                      │
│  ├── en/                                                        │
│  │   ├── common.json      → { "buttons": { "save": "Save" }}  │
│  │   ├── dashboard.json   → { "header": { "title": "..." }}   │
│  │   └── ...                                                   │
│  └── el/                                                        │
│      ├── common.json      → { "buttons": { "save": "Αποθή..." }}│
│      ├── dashboard.json   → { "header": { "title": "Πίνα..." }}│
│      └── ...                                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                        RENDERED HTML                            │
│                                                                 │
│  <html lang="en"> or <html lang="el">                         │
│  <h1>Dashboard</h1> or <h1>Πίνακας Ελέγχου</h1>               │
└─────────────────────────────────────────────────────────────────┘
```

## User Preference Flow

```
┌─────────────────┐
│ User Clicks     │
│ Language        │
│ Switcher        │
└────────┬────────┘
         │
         ↓
┌────────────────────────────────────┐
│ updateUserLocale('el')             │
│ (Server Action)                    │
└────────┬───────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│ UPDATE users                       │
│ SET preferredLocale = 'el'         │
│ WHERE id = userId                  │
│ (Prisma/PostgreSQL)                │
└────────┬───────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│ Redirect to /el/current-path       │
│ router.push('/el/dashboard')       │
└────────┬───────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│ Page reloads in Greek              │
│ Content re-fetched from            │
│ messages/el/*.json                 │
└────────────────────────────────────┘
```

## Translation Resolution

```
Component calls:
  t('dashboard.header.title')
         │
         ↓
┌────────────────────────────────────┐
│ next-intl resolves key path        │
│ 1. Check current locale (from req) │
│ 2. Navigate JSON: dashboard →      │
│    header → title                  │
└────────┬───────────────────────────┘
         │
         ↓
┌────────────────────────────────────┐
│ messages/en/dashboard.json         │
│ {                                  │
│   "header": {                      │
│     "title": "Dashboard"  ← Found! │
│   }                                │
│ }                                  │
└────────┬───────────────────────────┘
         │
         ↓
   Returns: "Dashboard"
   (or "Πίνακας Ελέγχου" if locale=el)
```

## Build-Time Validation Flow

```
pnpm build
    │
    ↓
┌─────────────────────────────────────┐
│ validate:i18n script runs           │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│ For each locale (el):               │
│   For each critical page:           │
│     1. Load en/{page}.json          │
│     2. Load el/{page}.json          │
│     3. Extract all keys from EN     │
│     4. Check each key exists in EL  │
│     5. Validate variables match     │
└────────┬────────────────────────────┘
         │
         ├─ Missing keys? → Exit code 1 → BUILD FAILS ❌
         │
         └─ All keys present? → Continue → next build ✅
```

## Middleware Routing Logic

```
Request: http://example.com/dashboard
         │
         ↓
┌────────────────────────────────────┐
│ Is locale in URL?                  │
│ Check: /el/dashboard ?             │
└────┬───────────────────────────────┘
     │
     ├─ YES → Use URL locale (el)
     │
     └─ NO → ┌─────────────────────────────────┐
             │ Check user preference in DB     │
             │ SELECT preferredLocale          │
             │ FROM users WHERE id = userId    │
             └────┬────────────────────────────┘
                  │
                  ├─ Has preference (el) → Redirect to /el/dashboard
                  │
                  └─ No preference → ┌─────────────────────────┐
                                     │ Check Accept-Language   │
                                     │ header                  │
                                     └────┬────────────────────┘
                                          │
                                          ├─ el-GR → Use el
                                          │
                                          └─ Default → Use en
```

## Data Flow: Language Change

```
1. USER ACTION
   │ Clicks "Ελληνικά" in switcher
   │
   ↓
2. CLIENT COMPONENT
   │ <LanguageSwitcher />
   │ handleLocaleChange('el')
   │
   ↓
3. SERVER ACTION
   │ updateUserLocale('el', '/dashboard')
   │ ├─ Validate locale
   │ ├─ Update DB: users.preferredLocale = 'el'
   │ └─ Return success
   │
   ↓
4. CLIENT NAVIGATION
   │ router.push('/el/dashboard')
   │ router.refresh()
   │
   ↓
5. MIDDLEWARE
   │ Detects /el/ prefix
   │ Sets locale header
   │
   ↓
6. SERVER RENDER
   │ Loads messages/el/*.json
   │ Renders Greek content
   │
   ↓
7. BROWSER
   │ Displays page in Greek
   │ URL: /el/dashboard
```

## File Dependencies

```
Application Code
     │
     ├─ Server Components
     │     └─ useTranslations() → i18n.ts → messages/*/
     │
     ├─ Client Components
     │     └─ useTranslations() → i18n.ts → messages/*/
     │
     ├─ Middleware
     │     └─ intlMiddleware() → i18n.ts
     │
     ├─ Server Actions
     │     └─ updateUserLocale() → Prisma → Database
     │
     └─ Utilities
           └─ formatCurrency() → Intl API
           └─ formatDate() → Intl API
```

## Component Integration Points

```
┌─────────────────────────────────────────────────────┐
│                  Layout / Page                      │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  <LanguageSwitcher />  (in header/nav)      │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Content using t('...')                     │  │
│  │  - Headings                                 │  │
│  │  - Buttons                                  │  │
│  │  - Form labels                              │  │
│  │  - Error messages                           │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  formatCurrency(), formatDate()             │  │
│  │  (for locale-aware formatting)              │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## TypeScript Type Flow

```
Translation Key Usage:
  t('dashboard.header.title')
     │
     ↓
┌──────────────────────────────────────┐
│ TypeScript checks against:          │
│ IntlMessages interface               │
│ (from types/i18n.d.ts)               │
└──────┬───────────────────────────────┘
       │
       ├─ Valid key? → ✅ Compile success
       │
       └─ Invalid key? → ❌ Type error:
           Property 'xyz' does not exist on type...
```

## Summary: Key Architectural Decisions

1. **next-intl** chosen for Next.js App Router native support
2. **Locale routing** via URL prefix (`/el/`)
3. **User preference** stored in PostgreSQL (users.preferredLocale)
4. **Build-time validation** ensures translation completeness
5. **Type safety** via TypeScript declaration merging
6. **Middleware integration** for automatic locale detection
7. **Separate translation files** per page for maintainability
8. **Server actions** for database updates (user preferences)
9. **Client component** for interactive language switching
10. **Fallback to English** for missing translations

---

**Architecture Version**: 1.0  
**Last Updated**: 2025-10-18  
**Status**: Production Ready
