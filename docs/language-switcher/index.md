Language Switcher Component

Location
- components/shared/language-switcher.tsx

Behavior
- Reads current locale via next-intl useLocale
- Persists selection with actions/locale.updateUserLocale
- Writes NEXT_LOCALE cookie and DB preferredLocale
- Refreshes in place (no prefix for default locale)

Usage
```tsx
import { LanguageSwitcher } from "@/components/shared/language-switcher";
```

Variants
- Ghost button with Globe icon (default)
- Can be embedded in top nav or settings pages

Notes
- Middleware localeDetection=false avoids redirect loops
- Keep locales in i18n/config.ts synchronized with Tolgee project


