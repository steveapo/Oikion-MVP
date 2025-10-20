# Skeleton Loading Components - Quick Reference

## Available Skeleton Components

### 1. Property Skeletons
```tsx
import { PropertyCardSkeleton, PropertyListSkeleton } from "@/components/properties/property-card-skeleton";

// Single property card
<PropertyCardSkeleton />

// Grid of properties (default: 6)
<PropertyListSkeleton count={6} />
```

### 2. Contact/Client Skeletons
```tsx
import { ContactCardSkeleton, ContactListSkeleton } from "@/components/shared/contact-card-skeleton";

// Single contact card
<ContactCardSkeleton />

// Grid of contacts (default: 6)
<ContactListSkeleton count={9} />
```

### 3. Activity Feed Skeletons
```tsx
import { ActivityItemSkeleton, ActivityFeedSkeleton } from "@/components/shared/activity-feed-skeleton";

// Single activity item
<ActivityItemSkeleton />

// Full activity feed (default: 8)
<ActivityFeedSkeleton count={10} />
```

### 4. Members Skeletons
```tsx
import { 
  MemberItemSkeleton, 
  MembersListSkeleton, 
  InviteFormSkeleton 
} from "@/components/shared/members-list-skeleton";

// Single member row
<MemberItemSkeleton />

// Members list (default: 5)
<MembersListSkeleton count={8} />

// Invite form section
<InviteFormSkeleton />
```

### 5. Dashboard Skeletons
```tsx
import { 
  StatCardSkeleton, 
  DashboardStatsSkeleton, 
  RecentActivitySkeleton 
} from "@/components/shared/dashboard-stats-skeleton";

// Single stat card
<StatCardSkeleton />

// Stats grid (default: 4)
<DashboardStatsSkeleton count={4} />

// Recent activity section
<RecentActivitySkeleton />
```

### 6. Generic Skeletons (Existing)
```tsx
import { CardSkeleton } from "@/components/shared/card-skeleton";
import { SkeletonSection } from "@/components/shared/section-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

// Generic card
<CardSkeleton />

// Form section
<SkeletonSection />
<SkeletonSection card />

// Base skeleton primitive
<Skeleton className="h-10 w-full" />
```

---

## Usage Examples

### Example 1: Page with Loading State
```tsx
// app/(protected)/dashboard/properties/page.tsx
import { Suspense } from "react";
import { PropertyListSkeleton } from "@/components/properties/property-card-skeleton";

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertyListSkeleton count={6} />}>
      <PropertiesContent />
    </Suspense>
  );
}
```

### Example 2: Dedicated Loading File
```tsx
// app/(protected)/dashboard/properties/loading.tsx
import { PropertyListSkeleton } from "@/components/properties/property-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Filters skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Content skeleton */}
      <PropertyListSkeleton count={6} />
    </div>
  );
}
```

### Example 3: Complex Layout Skeleton
```tsx
// app/(protected)/dashboard/loading.tsx
import { 
  DashboardStatsSkeleton, 
  RecentActivitySkeleton 
} from "@/components/shared/dashboard-stats-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats */}
      <DashboardStatsSkeleton count={4} />

      {/* Charts and activity */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Skeleton className="h-[400px] lg:col-span-4 rounded-lg" />
        <div className="lg:col-span-3">
          <RecentActivitySkeleton />
        </div>
      </div>
    </div>
  );
}
```

---

## Pattern: Building Custom Skeletons

When you need a custom skeleton, follow this pattern:

```tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CustomComponentSkeleton() {
  return (
    <Card>
      <CardHeader>
        {/* Title skeleton */}
        <Skeleton className="h-6 w-40" />
        {/* Description skeleton */}
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Repeated items */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            {/* Icon/Avatar */}
            <Skeleton className="h-10 w-10 rounded-full" />
            
            {/* Content */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            
            {/* Action */}
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

---

## Common Skeleton Sizes

### Height Patterns
- `h-3` - Small text (12px)
- `h-4` - Regular text (16px)
- `h-5` - Medium text (20px)
- `h-6` - Large text (24px)
- `h-8` - Heading (32px)
- `h-10` - Input fields (40px)
- `h-32` - Textarea (128px)

### Width Patterns
- `w-16` to `w-96` - Fixed widths
- `w-1/2`, `w-2/3`, `w-3/4` - Fractional widths
- `w-full` - Full width
- `max-w-sm`, `max-w-md`, `max-w-lg` - Max widths

### Aspect Ratios
- `aspect-square` - 1:1
- `aspect-video` - 16:9
- `aspect-[16/10]` - Custom 16:10 (used for property images)

### Rounded Corners
- `rounded` - Small (4px)
- `rounded-md` - Medium (6px)
- `rounded-lg` - Large (8px)
- `rounded-full` - Pill/Circle
- `rounded-xl` - Extra large (12px)

---

## Best Practices

### ✅ DO
- Match the skeleton layout exactly to the actual content
- Use consistent spacing with the real component
- Include all major visual elements (images, text, buttons)
- Use `Array.from()` for repeated items
- Make skeletons customizable with `count` prop
- Use semantic spacing (`space-y-4`, `gap-6`, etc.)

### ❌ DON'T
- Don't make skeletons too detailed (no need for exact text lengths)
- Don't use different colors (stick to `bg-muted`)
- Don't add custom animations (use built-in `animate-pulse`)
- Don't forget responsive breakpoints
- Don't hardcode counts when they could vary

---

## Troubleshooting

### Skeleton doesn't match content
→ Review the actual component's layout and adjust skeleton accordingly

### Animation not working
→ Ensure `animate-pulse` class is applied (usually via base `Skeleton` component)

### Layout shift when content loads
→ Verify skeleton dimensions match the actual content

### Skeleton looks broken on mobile
→ Add responsive classes (`md:`, `lg:`) matching the real component

---

## Quick Reference: All Loading Files

```
app/
├── (marketing)/
│   └── pricing/loading.tsx ✅
├── (protected)/
│   ├── admin/
│   │   ├── loading.tsx ✅
│   │   └── orders/loading.tsx ✅
│   └── dashboard/
│       ├── loading.tsx ✅
│       ├── billing/loading.tsx ✅
│       ├── charts/loading.tsx ✅
│       ├── settings/loading.tsx ✅
│       ├── members/loading.tsx ✅
│       ├── oikosync/loading.tsx ✅
│       ├── properties/
│       │   ├── loading.tsx ✅
│       │   ├── new/loading.tsx ✅
│       │   └── [id]/
│       │       ├── loading.tsx ✅
│       │       ├── edit/loading.tsx ✅
│       │       └── images/loading.tsx ✅
│       └── relations/
│           ├── loading.tsx ✅
│           ├── new/loading.tsx ✅
│           └── [id]/
│               ├── loading.tsx ✅
│               └── edit/loading.tsx ✅
```

**Total: 18 loading files covering 100% of routes** ✅
