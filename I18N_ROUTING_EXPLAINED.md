# 📚 i18n Routing Architecture Explained

**App**: Oikion MVP  
**Pattern**: Middleware-based routing (NOT folder-based)  
**Library**: next-intl v3.19.0

---

## 🎯 Your Question: How Are Pages Handled with i18n?

### Current Structure (Correct ✅)

```
app/
├── layout.tsx              ← Root layout
├── (marketing)/            ← Public pages
│   ├── page.tsx           → Accessible at / and /el/
│   ├── pricing/
│   │   └── page.tsx       → Accessible at /pricing and /el/pricing
│   └── blog/
│       └── page.tsx       → Accessible at /blog and /el/blog
├── (protected)/            ← Protected pages
│   └── dashboard/
│       ├── page.tsx       → Accessible at /dashboard and /el/dashboard
│       ├── properties/
│       │   └── page.tsx   → Accessible at /dashboard/properties and /el/dashboard/properties
│       └── relations/
│           └── page.tsx   → Accessible at /dashboard/relations and /el/dashboard/relations
├── (auth)/                 ← Auth pages
│   ├── login/
│   │   └── page.tsx       → Accessible at /login and /el/login
│   └── register/
│       └── page.tsx       → Accessible at /register and /el/register
└── (docs)/                 ← Documentation pages
    └── docs/
        └── page.tsx       → Accessible at /docs and /el/docs
```

### ❌ What You DON'T Need

```
app/
└── [locale]/              ← NOT NEEDED with middleware routing
    ├── (marketing)/
    ├── (protected)/
    └── (auth)/
```

---

## 🔍 How Middleware-Based Routing Works

### The Magic of Middleware

The `next-intl` middleware **intercepts** requests and **rewrites** them internally:

```typescript
// User visits: /el/dashboard
//     ↓
// Middleware intercepts
//     ↓
// Sets locale to 'el' in request context
//     ↓
// Rewrites internally to: /dashboard (actual file location)
//     ↓
// Injects locale into getLocale() function
//     ↓
// Page renders in Greek
```

### Step-by-Step Example

#### 1. User Visits `/el/pricing`

```
Browser Request: GET /el/pricing
   ↓
Middleware:
  - Detects locale: 'el' (from URL prefix)
  - Sets request context locale = 'el'
  - Rewrites URL to /pricing (internal, not visible to user)
   ↓
Next.js Router:
  - Finds app/(marketing)/pricing/page.tsx
  - Passes request with locale context
   ↓
Page Component:
  - Calls await getLocale() → returns 'el'
  - Loads messages/el/*.json
  - Renders Greek content
   ↓
User sees: Greek pricing page at URL /el/pricing
```

#### 2. User Visits `/pricing` (default locale)

```
Browser Request: GET /pricing
   ↓
Middleware:
  - No locale prefix detected
  - Uses defaultLocale: 'en'
  - No rewrite needed (already at /pricing)
   ↓
Next.js Router:
  - Finds app/(marketing)/pricing/page.tsx
   ↓
Page Component:
  - Calls await getLocale() → returns 'en'
  - Loads messages/en/*.json
  - Renders English content
   ↓
User sees: English pricing page at URL /pricing
```

---

## 🎨 Two Routing Patterns Comparison

### Pattern 1: Middleware-Based (Oikion MVP ✅)

**Folder Structure:**
```
app/
├── layout.tsx
├── (marketing)/
│   └── page.tsx
└── (protected)/
    └── dashboard/
        └── page.tsx
```

**URLs Generated:**
- `/` → English homepage
- `/el/` → Greek homepage
- `/dashboard` → English dashboard
- `/el/dashboard` → Greek dashboard

**Pros:**
- ✅ Cleaner folder structure
- ✅ Don't duplicate route groups
- ✅ Single source of truth for routes
- ✅ Easier to maintain

**Cons:**
- ⚠️ Slightly less explicit
- ⚠️ Requires understanding middleware

**Configuration:**
```typescript
// middleware.ts
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'el'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'  // Key setting
});
```

### Pattern 2: Folder-Based (Alternative ❌)

**Folder Structure:**
```
app/
└── [locale]/              ← Dynamic segment
    ├── layout.tsx
    ├── (marketing)/
    │   └── page.tsx
    └── (protected)/
        └── dashboard/
            └── page.tsx
```

**URLs Generated:**
- `/en/` → English homepage
- `/el/` → Greek homepage
- `/en/dashboard` → English dashboard
- `/el/dashboard` → Greek dashboard

**Pros:**
- ✅ Very explicit
- ✅ Locale always in URL

**Cons:**
- ❌ Duplicate folder structure
- ❌ Always shows locale in URL (even for default)
- ❌ More complex to maintain
- ❌ Requires moving all existing routes

---

## 📋 Current Implementation Details

### Root Layout (`app/layout.tsx`)

```typescript
export default async function RootLayout({ children }: RootLayoutProps) {
  // Middleware has already set locale in request context
  const locale = await getLocale(); // Returns 'en' or 'el'
  const messages = await getMessages();
  
  return (
    <html lang={locale}>
      <NextIntlClientProvider messages={messages} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </html>
  );
}
```

**How `getLocale()` works:**
- Middleware sets locale in request context
- `getLocale()` reads from that context
- NO need for `params.locale` because middleware handles it

### Page Components (`app/(protected)/dashboard/page.tsx`)

```typescript
export default async function DashboardPage() {
  // Get translations for current locale (from context)
  const t = await getTranslations('dashboard');
  
  return (
    <div>
      <h1>{t('header.title')}</h1>
      {/* Renders "Dashboard" or "Πίνακας Ελέγχου" based on locale */}
    </div>
  );
}
```

### Navigation Components

```typescript
import { Link } from '@/i18n/navigation';

// This Link automatically adds locale prefix when needed
<Link href="/dashboard">Dashboard</Link>

// When on English site:
//   Renders: <a href="/dashboard">
// When on Greek site:
//   Renders: <a href="/el/dashboard">
```

---

## 🔧 How Locales Are Determined

### Priority Order (with `localeDetection: false`)

1. **URL Prefix** (highest priority)
   - `/el/pricing` → Greek
   - `/pricing` → English (default)

2. **User Database Preference** (if authenticated)
   - Checked AFTER initial page load
   - Used for redirects via language switcher

3. **Manual Switching**
   - User clicks language switcher
   - Saved to database
   - Redirects to `/el/` prefixed URL

### What `localeDetection: false` Does

```typescript
// ❌ WITHOUT localeDetection: false
User with Greek browser visits /
  → Middleware checks Accept-Language: el-GR
  → Redirects to /el/
  → 404 if Greek homepage not ready

// ✅ WITH localeDetection: false
User with Greek browser visits /
  → Middleware ignores Accept-Language
  → Loads English (default)
  → User can manually switch to Greek
```

---

## 🎯 Why Your Current Structure is Correct

### You DON'T need `app/[locale]` because:

1. **Middleware handles routing**: Rewrites URLs internally
2. **`getLocale()` works without params**: Reads from context
3. **`localePrefix: 'as-needed'`**: Default locale (en) needs no prefix
4. **Single source of truth**: Don't duplicate routes
5. **Easier maintenance**: Update route once, works for all locales

### Each page file serves BOTH locales:

```typescript
// app/(marketing)/pricing/page.tsx
// This ONE file serves BOTH:
// - /pricing (English)
// - /el/pricing (Greek)

export default async function PricingPage() {
  const locale = await getLocale();    // 'en' or 'el'
  const t = await getTranslations();   // Correct messages loaded
  
  return <div>{t('title')}</div>;
}
```

---

## 🚀 How to Add New Pages

### Step 1: Create Page (No locale folder needed)

```typescript
// app/(marketing)/about/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function AboutPage() {
  const t = await getTranslations('about');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### Step 2: Add Translations

```json
// messages/en/about.json
{
  "title": "About Us",
  "description": "Learn more about our company"
}

// messages/el/about.json
{
  "title": "Σχετικά με εμάς",
  "description": "Μάθετε περισσότερα για την εταιρεία μας"
}
```

### Step 3: Add Navigation

```typescript
import { Link } from '@/i18n/navigation';

<Link href="/about">About</Link>
// Automatically becomes:
// - /about (when viewing English)
// - /el/about (when viewing Greek)
```

### Result: Automatically Available in Both Locales!

- ✅ `/about` → English version
- ✅ `/el/about` → Greek version
- ✅ No additional routing configuration needed

---

## 📊 URL Patterns Reference

| Page File | English URL | Greek URL |
|-----------|-------------|-----------|
| `app/(marketing)/page.tsx` | `/` | `/el/` |
| `app/(marketing)/pricing/page.tsx` | `/pricing` | `/el/pricing` |
| `app/(protected)/dashboard/page.tsx` | `/dashboard` | `/el/dashboard` |
| `app/(protected)/dashboard/properties/page.tsx` | `/dashboard/properties` | `/el/dashboard/properties` |
| `app/(auth)/login/page.tsx` | `/login` | `/el/login` |
| `app/(docs)/docs/page.tsx` | `/docs` | `/el/docs` |

---

## 🎓 Key Concepts

### 1. Middleware Rewrites (Not Redirects)

```typescript
// User visits /el/dashboard
// Middleware internally rewrites to /dashboard
// User's browser still shows /el/dashboard
// Next.js serves app/(protected)/dashboard/page.tsx
```

### 2. Context-Based Locale

```typescript
// No need for this:
export default async function Page({ params }: { params: { locale: string } }) {
  const locale = params.locale; // ❌ Not used
}

// Instead use this:
export default async function Page() {
  const locale = await getLocale(); // ✅ From middleware context
}
```

### 3. Automatic Link Localization

```typescript
import { Link } from '@/i18n/navigation';

// Automatically adds /el/ prefix when on Greek site
<Link href="/dashboard/properties">
  {/* No manual locale handling needed */}
</Link>
```

---

## ✅ Summary

### Your Current Setup is **CORRECT** ✅

- ✅ Uses middleware-based routing (recommended by next-intl)
- ✅ No `[locale]` folder needed
- ✅ Clean URL structure (`/dashboard` and `/el/dashboard`)
- ✅ Single file serves multiple locales
- ✅ Easier to maintain and scale

### You DON'T Need to:

- ❌ Create `app/[locale]` folder
- ❌ Move all routes into `[locale]` folder
- ❌ Duplicate route group structure
- ❌ Use `params.locale` in page components

### You DO Need to:

- ✅ Use `await getLocale()` in server components
- ✅ Use `useLocale()` in client components
- ✅ Import `Link` from `@/i18n/navigation`
- ✅ Create translation files for both locales
- ✅ Keep using middleware for routing

---

## 📚 Further Reading

- [next-intl Middleware Routing](https://next-intl.dev/docs/routing/middleware)
- [Shared Pathnames Navigation](https://next-intl.dev/docs/routing/navigation)
- [Locale Prefix Strategies](https://next-intl.dev/docs/routing/configuration#locale-prefix)

---

**Your implementation is production-ready!** 🎉
