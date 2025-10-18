# SEO Localization Testing Guide

## Quick Verification Steps

### 1. Start Development Server
```bash
pnpm dev
```

### 2. Test English Homepage
**URL**: `http://localhost:3000/`

**Expected in HTML source** (`view-source:http://localhost:3000/`):
```html
<!-- Title -->
<title>Oikion - Operating System for Greek Real Estate Agencies</title>

<!-- Meta Description -->
<meta name="description" content="Complete MLS, CRM, and activity feed solution for real estate agencies in Greece...">

<!-- Open Graph Locale -->
<meta property="og:locale" content="en_US">
<meta property="og:url" content="https://yourdomain.com/">

<!-- Canonical URL -->
<link rel="canonical" href="https://yourdomain.com/">

<!-- hreflang Tags -->
<link rel="alternate" hreflang="en" href="https://yourdomain.com/">
<link rel="alternate" hreflang="el" href="https://yourdomain.com/el/">
<link rel="alternate" hreflang="x-default" href="https://yourdomain.com/">
```

### 3. Test Greek Homepage
**URL**: `http://localhost:3000/el/`

**Expected in HTML source** (`view-source:http://localhost:3000/el/`):
```html
<!-- Title (Greek) -->
<title>Oikion - Λειτουργικό Σύστημα για Ελληνικά Μεσιτικά Γραφεία</title>

<!-- Meta Description (Greek) -->
<meta name="description" content="Ολοκληρωμένη λύση MLS, CRM και ροής δραστηριοτήτων...">

<!-- Open Graph Locale -->
<meta property="og:locale" content="el_GR">
<meta property="og:url" content="https://yourdomain.com/el/">

<!-- Canonical URL -->
<link rel="canonical" href="https://yourdomain.com/el/">

<!-- hreflang Tags -->
<link rel="alternate" hreflang="en" href="https://yourdomain.com/">
<link rel="alternate" hreflang="el" href="https://yourdomain.com/el/">
<link rel="alternate" hreflang="x-default" href="https://yourdomain.com/">
```

### 4. Test English Pricing Page
**URL**: `http://localhost:3000/pricing`

**Expected**:
- Title: "Pricing - Oikion"
- Description: "Choose the perfect plan for your real estate agency..."
- hreflang tags for `/pricing` and `/el/pricing`
- og:locale: `en_US`

### 5. Test Greek Pricing Page
**URL**: `http://localhost:3000/el/pricing`

**Expected**:
- Title: "Τιμολόγηση - Oikion"
- Description: "Επιλέξτε το ιδανικό πλάνο για το μεσιτικό σας γραφείο..."
- hreflang tags for `/pricing` and `/el/pricing`
- og:locale: `el_GR`

---

## Command-Line Verification

### Extract hreflang tags from English page
```bash
curl -s http://localhost:3000/pricing | grep -o 'hreflang="[^"]*"'
```

**Expected output**:
```
hreflang="en"
hreflang="el"
hreflang="x-default"
```

### Extract Open Graph locale from Greek page
```bash
curl -s http://localhost:3000/el/pricing | grep 'og:locale'
```

**Expected output**:
```html
<meta property="og:locale" content="el_GR">
```

### Extract canonical URL
```bash
curl -s http://localhost:3000/el/pricing | grep 'rel="canonical"'
```

**Expected output**:
```html
<link rel="canonical" href="https://yourdomain.com/el/pricing">
```

---

## Browser DevTools Verification

### Method 1: Using Browser Inspector

1. Open page in browser
2. Right-click → "Inspect" (or F12)
3. Go to **Elements** tab (Chrome) or **Inspector** tab (Firefox)
4. Expand `<head>` section
5. Look for:
   - `<title>` tag
   - `<meta name="description">` tag
   - `<meta property="og:locale">` tag
   - `<link rel="canonical">` tag
   - `<link rel="alternate" hreflang="...">` tags

### Method 2: Using Network Tab

1. Open DevTools → **Network** tab
2. Refresh page
3. Click on first request (the HTML document)
4. Go to **Response** tab
5. Search for `hreflang` or `og:locale`

---

## Google Search Console Testing (Production)

After deploying to production:

### 1. URL Inspection Tool

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Enter URL: `https://yourdomain.com/pricing`
3. Click "Test Live URL"
4. View "More Info" → expand "Page Resources"
5. Check that hreflang tags are detected

### 2. International Targeting Report

1. Go to **Legacy tools and reports** → **International Targeting**
2. Check that both `/pricing` and `/el/pricing` are listed
3. Verify language/region mappings

### 3. Coverage Report

1. Go to **Indexing** → **Coverage**
2. Ensure both English and Greek versions are indexed
3. No "Duplicate without user-selected canonical" errors

---

## SEO Testing Tools

### 1. Google Rich Results Test
**URL**: https://search.google.com/test/rich-results

- Enter your page URL
- Check for Open Graph metadata
- Verify no errors

### 2. Ahrefs Site Audit (Paid)
- Checks hreflang implementation
- Detects missing canonical tags
- Validates locale markup

### 3. Screaming Frog SEO Spider (Free/Paid)
- Crawl site with locale filtering
- Export hreflang tags
- Check for broken links between locales

---

## Common Issues & Solutions

### Issue 1: hreflang tags not appearing

**Cause**: Middleware not running correctly

**Solution**: Check `middleware.ts` is properly handling locale detection

**Verify**:
```bash
curl -I http://localhost:3000/el/pricing | grep "content-language"
```

### Issue 2: Wrong og:locale value

**Cause**: `constructMetadata()` not receiving locale parameter

**Solution**: Ensure all marketing pages call:
```typescript
const locale = await getLocale();
constructMetadata({ locale, pathname: '/...' });
```

### Issue 3: Duplicate canonical URLs

**Cause**: Both locales pointing to same canonical URL

**Verify**:
- English page canonical should be `/pricing`
- Greek page canonical should be `/el/pricing`

### Issue 4: x-default pointing to wrong locale

**Current implementation**: x-default points to English (default)

**This is correct** per Google guidelines

---

## Validation Checklist

- [ ] `pnpm validate:i18n` passes ✅
- [ ] English homepage has correct title/description
- [ ] Greek homepage has Greek title/description
- [ ] Pricing page metadata changes per locale
- [ ] Blog page metadata changes per locale
- [ ] View source shows hreflang tags
- [ ] View source shows correct og:locale per locale
- [ ] View source shows correct canonical URL per locale
- [ ] x-default hreflang tag exists
- [ ] No console errors in browser
- [ ] No TypeScript compilation errors
- [ ] Build completes: `pnpm build`

---

## Expected SEO Results (After Indexing)

### Google Search (English)
**Query**: "real estate software greece"  
**Expected**: Shows English version with English title/description  
**URL in SERPs**: `https://yourdomain.com/pricing`

### Google Search (Greek)
**Query**: "λογισμικό ακινήτων ελλάδα"  
**Expected**: Shows Greek version with Greek title/description  
**URL in SERPs**: `https://yourdomain.com/el/pricing`

### Social Media Shares
**Facebook/LinkedIn**: Shows correct language based on shared URL  
- Share `yourdomain.com/pricing` → English metadata  
- Share `yourdomain.com/el/pricing` → Greek metadata

---

## Performance Testing

### Lighthouse SEO Score

Run Lighthouse audit in Chrome DevTools:

```bash
# English version
npx lighthouse http://localhost:3000/pricing --only-categories=seo --view

# Greek version
npx lighthouse http://localhost:3000/el/pricing --only-categories=seo --view
```

**Expected SEO score**: 90-100

**Key checks**:
- ✅ Document has a `<title>` element
- ✅ Document has a meta description
- ✅ Document has a valid `hreflang`
- ✅ Document has a valid `rel=canonical`

---

## Monitoring & Maintenance

### Weekly Checks
- [ ] Check Google Search Console for indexing issues
- [ ] Monitor CTR for both locales
- [ ] Check for 404 errors on locale-specific pages

### Monthly Checks
- [ ] Review hreflang implementation in GSC
- [ ] Analyze organic traffic per locale
- [ ] Check for duplicate content issues

### After Content Updates
- [ ] Run `pnpm validate:i18n`
- [ ] Verify translations are complete
- [ ] Check that new pages have metadata

---

**Last Updated**: 2025-10-19  
**Status**: Ready for Testing ✅
