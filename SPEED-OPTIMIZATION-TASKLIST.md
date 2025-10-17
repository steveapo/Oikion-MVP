# 🚀 Speed Optimization Task List

**Objective**: Achieve sub-300ms page loads and 95+ Lighthouse scores  
**Current Performance**: 400-600ms (first load), 50-100ms (cached)  
**Target Performance**: 200-300ms (first load), <50ms (cached)

---

## ✅ Already Completed (Baseline)

- [x] Stripe API caching with 5-minute TTL
- [x] Parallel data fetching with `Promise.all()`
- [x] Skeleton loading states on major pages
- [x] Helper functions for combined queries (`getUserWithSubscription`)
- [x] SWC minification enabled
- [x] Image optimization with Next.js Image component
- [x] AVIF image format support

**Current Status**: 66-75% faster than baseline ✨

---

## 🎯 Phase 1: Quick Wins (High Impact, Low Effort) ✅ COMPLETE

**Status**: ✅ All tasks completed (2025-10-16)  
**See**: [PHASE1-OPTIMIZATIONS-SUMMARY.md](PHASE1-OPTIMIZATIONS-SUMMARY.md) for detailed results

### 1.1 Database Query Optimization
**Impact**: ⚡⚡⚡ High | **Effort**: 🔧 Low | **Time**: 2 hours

- [ ] **Limit `getClient()` includes in detail pages**
  - File: `actions/clients.ts`
  - Current: Loads ALL interactions, notes, tasks
  - Target: Limit to 10 recent interactions, 5 notes, 10 incomplete tasks
  - Expected gain: 50-70% faster client detail loads

- [ ] **Limit `getProperty()` includes in detail pages**
  - File: `actions/properties.ts`
  - Current: Loads ALL media, inquiries
  - Target: Limit to 8 images, 10 recent inquiries
  - Expected gain: 50-70% faster property detail loads

- [ ] **Add pagination to timeline components**
  - File: `components/contacts/contact-timeline.tsx`
  - Target: Load 10 items initially, "Load more" button for older items

**Code Pattern**:
```typescript
// actions/clients.ts - getClient()
include: {
  interactions: { 
    take: 10, 
    orderBy: { timestamp: 'desc' } 
  },
  notes: { 
    take: 5, 
    orderBy: { createdAt: 'desc' } 
  },
  tasks: { 
    where: { status: { not: 'COMPLETED' } }, 
    take: 10,
    orderBy: { dueDate: 'asc' }
  }
}
```

---

### 1.2 Add Missing Loading States
**Impact**: ⚡⚡ Medium (UX) | **Effort**: 🔧 Low | **Time**: 1 hour

- [ ] **Create `app/(protected)/dashboard/properties/loading.tsx`**
  - Use skeleton pattern from existing loading files
  - Grid of 6 property card skeletons

- [ ] **Create `app/(protected)/dashboard/relations/loading.tsx`**
  - List of client card skeletons

- [ ] **Create `app/(protected)/dashboard/oikosync/loading.tsx`**
  - Activity feed skeleton (10 items)

- [ ] **Create `app/(protected)/dashboard/properties/[id]/loading.tsx`**
  - Property detail skeleton

- [ ] **Create `app/(protected)/dashboard/relations/[id]/loading.tsx`**
  - Client detail skeleton

**Reference**: Use pattern from `app/(marketing)/pricing/loading.tsx`

---

### 1.3 Enable ISR for Static Pages
**Impact**: ⚡⚡⚡ High | **Effort**: 🔧 Very Low | **Time**: 30 mins

- [ ] **Add ISR to pricing page**
  - File: `app/(marketing)/pricing/page.tsx`
  - Add: `export const revalidate = 3600;` (1 hour)

- [ ] **Add ISR to docs pages**
  - File: `app/(docs)/docs/[[...slug]]/page.tsx`
  - Add: `export const revalidate = 7200;` (2 hours)

- [ ] **Add ISR to blog posts**
  - File: `app/(marketing)/(blog-post)/blog/[slug]/page.tsx`
  - Add: `export const revalidate = 3600;` (1 hour)

- [ ] **Add ISR to marketing pages**
  - File: `app/(marketing)/page.tsx`
  - Add: `export const revalidate = 1800;` (30 mins)

**Expected Impact**: Near-instant loads for static content after first visit

---

### 1.4 Next.js Config Enhancements
**Impact**: ⚡⚡ Medium | **Effort**: 🔧 Very Low | **Time**: 15 mins

- [ ] **Update `next.config.js` with optimizations**
  ```javascript
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    
    // Remove console.logs in production
    compiler: {
      removeConsole: process.env.NODE_ENV === "production",
    },
    
    // Optimize images
    images: {
      remotePatterns: [/* ... existing ... */],
      formats: ['image/avif', 'image/webp'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    
    // Package import optimization
    experimental: {
      serverComponentsExternalPackages: ["@prisma/client"],
      optimizePackageImports: [
        'lucide-react', 
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-select',
        'recharts'
      ],
    },
  };
  ```

**Expected Impact**: 10-20% smaller bundle size

---

## 🚀 Phase 2: Medium Impact Optimizations

### 2.1 Dynamic Imports for Heavy Components
**Impact**: ⚡⚡⚡ High | **Effort**: 🔧🔧 Medium | **Time**: 3 hours

- [ ] **Dynamic import for chart components**
  - Files: All pages using `components/charts/*`
  - Pattern:
    ```typescript
    import dynamic from 'next/dynamic';
    
    const RadialChartGrid = dynamic(
      () => import('@/components/charts/radial-chart-grid'),
      { 
        loading: () => <Skeleton className="h-[300px]" />,
        ssr: false
      }
    );
    ```
  - Target files:
    - `app/(protected)/dashboard/charts/page.tsx`
    - Any dashboard pages with heavy visualizations

- [ ] **Dynamic import for modal components**
  - Files with heavy modals:
    - `components/contacts/add-interaction-modal.tsx`
    - `components/contacts/add-note-modal.tsx`
    - `components/contacts/add-task-modal.tsx`
  - Only load when triggered

- [ ] **Dynamic import for form components**
  - Heavy forms with validation:
    - Property forms (large schema)
    - Client relationship forms
  - Load on route navigation, not initial bundle

**Expected Impact**: 30-40% faster initial page load

---

### 2.2 Image Loading Strategy
**Impact**: ⚡⚡ Medium | **Effort**: 🔧 Low | **Time**: 1.5 hours

- [ ] **Audit and fix image priority flags**
  - Review all `<Image>` components
  - Above-the-fold images: `priority={true}`
  - Below-the-fold: `loading="lazy"` (default)

- [ ] **Add blur placeholders to property images**
  - File: `components/properties/property-image-gallery.tsx`
  - Generate blur hashes server-side
  - Pattern:
    ```typescript
    <Image
      src={image.url}
      placeholder="blur"
      blurDataURL={image.blurHash}
    />
    ```

- [ ] **Optimize image sizes in property listings**
  - File: `app/(protected)/dashboard/properties/page.tsx`
  - Use `sizes` prop for responsive images
  - Pattern: `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`

**Expected Impact**: Better LCP (Largest Contentful Paint) scores

---

### 2.3 Reduce Client-Side JavaScript
**Impact**: ⚡⚡⚡ High | **Effort**: 🔧🔧 Medium | **Time**: 4 hours

- [ ] **Split server/client components in dashboard**
  - File: `app/(protected)/dashboard/page.tsx`
  - Move static content to Server Components
  - Keep only interactive parts as Client Components

- [ ] **Optimize search command component**
  - File: `components/dashboard/search-command.tsx`
  - Consider lazy loading with keyboard shortcut trigger
  - Reduce bundle impact

- [ ] **Review and optimize form components**
  - Analyze `react-hook-form` usage
  - Split validation schemas (load on-demand)
  - Consider server-side validation only for simple forms

- [ ] **Tree-shake unused UI imports**
  - Audit: `grep -r "from \"@/components/ui\"" app/`
  - Replace barrel exports with direct imports
  - Example:
    ```typescript
    // ❌ Before
    import { Button, Card, Dialog } from "@/components/ui";
    
    // ✅ After
    import { Button } from "@/components/ui/button";
    import { Card } from "@/components/ui/card";
    ```

**Expected Impact**: 20-30% less JavaScript shipped to client

---

## 🔥 Phase 3: Advanced Optimizations

### 3.1 Query Result Caching
**Impact**: ⚡⚡⚡ High | **Effort**: 🔧🔧🔧 High | **Time**: 6 hours

- [ ] **Create cached query helpers in `lib/cache.ts`**
  ```typescript
  import { unstable_cache } from 'next/cache';
  
  export function createCachedQuery<T>(
    queryFn: () => Promise<T>,
    key: string[],
    revalidate: number
  ) {
    return unstable_cache(queryFn, key, { 
      revalidate,
      tags: [key[0]] 
    });
  }
  ```

- [ ] **Implement caching for `getProperties()`**
  - File: `actions/properties.ts`
  - Cache key: `['properties', orgId, JSON.stringify(filters)]`
  - Revalidate: 60 seconds
  - Invalidate on: Property create/update/delete

- [ ] **Implement caching for `getClients()`**
  - File: `actions/clients.ts`
  - Cache key: `['clients', orgId, JSON.stringify(filters)]`
  - Revalidate: 60 seconds
  - Invalidate on: Client create/update/delete

- [ ] **Add cache invalidation to mutations**
  - Use `revalidateTag()` in create/update/delete actions
  - Pattern:
    ```typescript
    import { revalidateTag } from 'next/cache';
    
    export async function createProperty(data) {
      // ... create logic
      revalidateTag('properties');
      revalidatePath('/dashboard/properties');
    }
    ```

- [ ] **Implement dashboard stats caching**
  - Cache: Activity counts, recent items
  - Revalidate: 5 minutes
  - Reduces DB load on frequent dashboard visits

**Expected Impact**: Instant repeat loads within cache window (60s)

---

### 3.2 Parallel Route Loading
**Impact**: ⚡⚡ Medium | **Effort**: 🔧🔧🔧 High | **Time**: 5 hours

- [ ] **Research Next.js 14 parallel routes**
  - Read: https://nextjs.org/docs/app/building-your-application/routing/parallel-routes

- [ ] **Refactor dashboard with parallel routes**
  - Structure:
    ```
    app/(protected)/dashboard/
      @stats/page.tsx       // Quick stats
      @recent/page.tsx      // Recent activity
      layout.tsx            // Combines slots
      page.tsx              // Main content
    ```

- [ ] **Implement parallel loading for property detail**
  - Split: Property data, Images, Related clients, Activity timeline
  - Each loads independently

**Expected Impact**: Individual sections load independently, better perceived performance

---

### 3.3 Bundle Analysis and Optimization
**Impact**: ⚡⚡ Medium | **Effort**: 🔧🔧 Medium | **Time**: 3 hours

- [ ] **Install bundle analyzer**
  ```bash
  pnpm add -D @next/bundle-analyzer
  ```

- [ ] **Configure in `next.config.js`**
  ```javascript
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
  
  module.exports = withBundleAnalyzer(withContentlayer(nextConfig));
  ```

- [ ] **Analyze bundle**
  ```bash
  ANALYZE=true pnpm build
  ```

- [ ] **Identify and optimize large packages**
  - Review packages > 50KB
  - Consider alternatives or lazy loading
  - Common culprits:
    - `recharts` → dynamic import
    - `date-fns` → use only needed functions
    - `@radix-ui/*` → ensure tree-shaking works

- [ ] **Implement code splitting by route**
  - Ensure each route has its own chunk
  - Avoid shared chunks > 100KB

**Expected Impact**: 15-25% smaller bundle size

---

## 🌟 Phase 4: Future Enhancements

### 4.1 Real User Monitoring (RUM)
**Impact**: ⚡ Low (Monitoring) | **Effort**: 🔧 Low | **Time**: 1 hour

- [ ] **Enable Vercel Speed Insights** (already installed)
  - File: `components/analytics.tsx`
  - Verify it's rendering in production

- [ ] **Add custom performance marks**
  - File: Create `lib/performance.ts`
  - Track: Time to interactive, data fetch duration
  - Pattern:
    ```typescript
    performance.mark('data-fetch-start');
    await fetchData();
    performance.mark('data-fetch-end');
    performance.measure('data-fetch', 'data-fetch-start', 'data-fetch-end');
    ```

- [ ] **Set up Lighthouse CI**
  - Add to GitHub Actions
  - Fail builds if scores drop below thresholds

---

### 4.2 Partial Pre-rendering (Next.js 15+)
**Impact**: ⚡⚡⚡ High | **Effort**: 🔧 Low | **Time**: 30 mins (when available)

- [ ] **Upgrade to Next.js 15** (when stable)

- [ ] **Enable PPR in `next.config.js`**
  ```javascript
  experimental: {
    ppr: true,
  }
  ```

- [ ] **Test hybrid static/dynamic rendering**
  - Static: Page shell, navigation, layout
  - Dynamic: User-specific data, real-time content

**Expected Impact**: Best of both worlds (static speed + dynamic data)

---

### 4.3 Edge Runtime for API Routes
**Impact**: ⚡⚡ Medium | **Effort**: 🔧🔧 Medium | **Time**: 4 hours

- [ ] **Migrate read-only APIs to edge runtime**
  - Candidates:
    - `api/organization/route.ts` (GET)
    - `api/user/route.ts` (GET)

- [ ] **Pattern**:
  ```typescript
  export const runtime = 'edge';
  
  export async function GET(request: Request) {
    // Use edge-compatible DB client (Prisma Data Proxy or Neon)
  }
  ```

- [ ] **Test with Neon serverless driver**
  - Replace Prisma for edge routes
  - Benchmark vs. standard runtime

**Expected Impact**: Lower latency for API calls (especially global users)

---

## 📊 Success Metrics

### Performance Targets

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| First Load (Dashboard) | 400-600ms | 200-300ms | Chrome DevTools |
| Cached Load | 50-100ms | <50ms | Chrome DevTools |
| Lighthouse Performance | ~85 | 95+ | Lighthouse CI |
| First Contentful Paint | ~1.2s | <0.8s | Web Vitals |
| Largest Contentful Paint | ~1.8s | <1.2s | Web Vitals |
| Time to Interactive | ~2.0s | <1.5s | Web Vitals |
| Bundle Size (gzipped) | TBD | <150KB | Bundle analyzer |
| Stripe API Calls/min | 1 | <0.2 | ✅ Already optimized |

---

## 🛠️ Testing Checklist

After each phase, verify:

- [ ] **TypeScript compilation**: `pnpm tsc --noEmit`
- [ ] **Build succeeds**: `pnpm build`
- [ ] **No console errors**: Check browser console
- [ ] **Core flows work**:
  - [ ] Login/logout
  - [ ] Create property
  - [ ] Create client
  - [ ] View dashboard
  - [ ] Filter lists
- [ ] **Loading states appear**: Throttle network in DevTools
- [ ] **Images load properly**: Check Network tab
- [ ] **Performance improved**: Compare Chrome DevTools metrics

---

## 📝 Documentation Updates

- [ ] Update `PERFORMANCE-OPTIMIZATIONS.md` with new techniques
- [ ] Add optimization guide to `docs/` folder
- [ ] Create `PERFORMANCE-MONITORING.md` for RUM setup
- [ ] Update README with performance badges (Lighthouse score)

---

## 🎯 Priority Recommendation

**Week 1** (Quick Wins):
1. Phase 1.1: Database query limits
2. Phase 1.2: Missing loading states
3. Phase 1.3: ISR for static pages
4. Phase 1.4: Next.js config

**Week 2** (Medium Impact):
1. Phase 2.1: Dynamic imports
2. Phase 2.2: Image optimization
3. Phase 2.3: Reduce client JS (start)

**Week 3** (Advanced):
1. Phase 2.3: Reduce client JS (complete)
2. Phase 3.1: Query caching
3. Phase 3.3: Bundle analysis

**Week 4** (Polish):
1. Phase 3.2: Parallel routes (optional)
2. Phase 4.1: RUM setup
3. Testing and documentation

---

## 🚨 Notes and Warnings

- **Cache invalidation is hard**: Test thoroughly when implementing Phase 3.1
- **PPR is experimental**: Wait for stable Next.js 15 release
- **Bundle analyzer**: Run locally, generates large HTML files
- **Dynamic imports**: Don't over-optimize, balance code splitting with HTTP requests
- **ISR revalidation**: Set conservative times initially, tune based on data freshness needs

---

**Last Updated**: 2025-10-16  
**Version**: 1.0  
**Author**: Performance Optimization Team  
**Status**: 📋 Ready for Implementation
