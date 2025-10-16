# Oikion UI Design System

## Overview

This document describes the Oikion UI design system — a comprehensive, token-based system built on Next.js, Tailwind CSS, and shadcn/ui. The system provides consistent visual hierarchy, spacing, interaction states, and accessibility features across the application.

## Design Principles

1. **Token-Based Architecture**: All design values reference CSS variables (zero hardcoded values)
2. **Accessibility First**: WCAG AA compliance minimum (4.5:1 contrast for body text)
3. **Consistent Interaction States**: All interactive elements implement 5 states (default, hover, focus, active, disabled)
4. **8-Point Spacing Rhythm**: Predictable, harmonious spacing system
5. **Performance**: Minimal bundle impact, reduced-motion support

---

## Design Tokens

### Color System

#### Neutral Ramp (12-step cool-gray)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|--------|
| `--neutral-1` | hsl(0 0% 100%) | hsl(0 0% 8%) | Surfaces, cards |
| `--neutral-2` | hsl(0 0% 97%) | hsl(0 0% 5.5%) | Page backgrounds |
| `--neutral-3` | hsl(0 0% 95%) | hsl(0 0% 10%) | Subtle borders |
| `--neutral-6` | hsl(0 0% 89.8%) | hsl(0 0% 14.9%) | Active borders, inputs |
| `--neutral-9` | hsl(0 0% 45%) | hsl(0 0% 64%) | Disabled text |
| `--neutral-11` | hsl(0 0% 20%) | hsl(0 0% 85%) | Secondary text |
| `--neutral-12` | hsl(0 0% 3.9%) | hsl(0 0% 98%) | Primary text |

**Usage in Tailwind**: `bg-neutral-1`, `text-neutral-12`, `border-neutral-6`

#### Semantic Colors

| Token | Value | Usage | Tailwind Class |
|-------|-------|-------|----------------|
| `--brand` | hsl(217 91% 60%) | Primary actions, links | `bg-brand`, `text-brand` |
| `--success` | hsl(160 84% 39%) | Success states | `bg-success`, `text-success` |
| `--warning` | hsl(25 95% 53%) | Warning alerts | `bg-warning`, `text-warning` |
| `--destructive` | hsl(0 84% 60%) | Destructive actions | `bg-destructive` |

#### Semantic Surfaces

| Token | Maps To | Tailwind Class |
|-------|---------|----------------|
| `--bg` | `--neutral-2` | `bg-bg` |
| `--surface` | `--neutral-1` | `bg-surface` |
| `--text-primary` | `--neutral-12` | `text-text-primary` |
| `--text-secondary` | `--neutral-12 / 0.66` (light) | `text-text-secondary` |

### Typography Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|--------|
| `text-xs` | 12px | 18px | Meta text, timestamps |
| `text-sm` | 14px | 22px | Secondary text, labels |
| `text-base` | 16px | 25px | Body text (default) |
| `text-lg` | 18px | 27px | Emphasized body |
| `text-xl` | 20px | 30px | Card titles |
| `text-2xl` | 24px | 34px | Section headings |
| `text-3xl` | 30px | 40px | Page headings |
| `text-4xl` | 36px | 44px | Hero text |
| `text-5xl` | 48px | 56px | Marketing headings |

### Spacing System (8-point grid)

| Token | Value | Usage |
|-------|-------|--------|
| `space-1` | 4px | Icon padding, micro gaps |
| `space-2` | 8px | Tight spacing |
| `space-3` | 12px | Form field padding |
| `space-4` | 16px | Default gap |
| `space-6` | 24px | Card padding (comfortable) |
| `space-8` | 32px | Section spacing |
| `space-10` | 40px | Large padding |
| `space-12` | 48px | Section margins |

### Border Radius

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|--------|
| `--radius-sm` | 6px | `rounded-sm` | Small chips, badges |
| `--radius` | 12px | `rounded` | Buttons, cards, inputs |
| `--radius-lg` | 16px | `rounded-lg` | Large cards, modals |
| `--radius-xl` | 24px | `rounded-xl` | Hero sections |

### Elevation (Shadows)

| Token | Shadow Definition | Tailwind Class | Usage |
|-------|------------------|----------------|--------|
| `--shadow-e0` | none | `shadow-e0` | Flat surfaces |
| `--shadow-e1` | Soft shadow | `shadow-e1` | Hover state, small elevation |
| `--shadow-e2` | Medium shadow | `shadow-e2` | Popovers, dropdowns |
| `--shadow-e3` | Strong shadow | `shadow-e3` | Modals, dialogs |

**Example**: `<Card elevation="e1" hoverable>...</Card>`

### Motion Tokens

| Token | Duration | Usage |
|-------|----------|--------|
| `--motion-micro` | 120ms | Button hover, icon changes |
| `--motion-fast` | 180ms | Tooltip, dropdown appear |
| `--motion-base` | 240ms | Modal enter, sheet slide |
| `--motion-slow` | 300ms | Page transitions |

**Tailwind**: `duration-micro`, `duration-fast`, `duration-base`, `duration-slow`

---

## Component Library

### Core Components

#### Button

**Enhanced with**:
- 5 states: default, hover, focus, active, disabled
- Size variants: `sm` (36px), `default` (40px), `lg` (48px), `icon` (40×40px)
- Loading state with spinner
- Brand, success, warning, destructive variants
- Minimum 44×44px touch targets

**Usage**:
```tsx
import { Button } from "@/components/ui/button";

<Button variant="brand" size="lg" loading>Save</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="icon"><Icon /></Button>
```

#### Input

**Enhanced with**:
- 5 states with visual feedback
- Helper text, error text, success text with icons
- Size variants: `sm`, `default`, `lg`
- Proper ARIA attributes

**Usage**:
```tsx
import { Input } from "@/components/ui/input";

<Input 
  id="email"
  error="Invalid email address"
  placeholder="Enter email"
/>
<Input 
  success="Email available"
  helperText="We'll never share your email"
/>
```

#### Card

**Enhanced with**:
- Padding variants: `compact`, `comfortable`, `spacious`
- Elevation support: `e0`, `e1`, `e2`
- Hoverable state with elevation transition
- Structured sections: CardHeader, CardTitle, CardDescription, CardContent, CardFooter

**Usage**:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card elevation="e1" hoverable padding="comfortable">
  <CardHeader>
    <CardTitle>Property Details</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Badge

**Enhanced with**:
- Semantic variants: `brand`, `success`, `warning`, `destructive`
- Outline variants: `brand-outline`, `success-outline`, etc.
- Size variants: `sm`, `default`, `lg`

**Usage**:
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success">Active</Badge>
<Badge variant="warning-outline">Pending</Badge>
```

### Layout Components

#### Container

Responsive container with breakpoint-aware max-widths and padding.

**Usage**:
```tsx
import { Container } from "@/components/ui/container";

<Container maxWidth="2xl" padding="default">
  {/* Content */}
</Container>
```

#### PageHeader

Page header with title, description, and actions slot.

**Usage**:
```tsx
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

<PageHeader
  title="Properties"
  description="Manage your property listings"
  actions={<Button>Add Property</Button>}
  spacing="comfortable"
/>
```

#### Section, Stack, Inline

Layout primitives for consistent spacing.

**Usage**:
```tsx
import { Section, Stack, Inline } from "@/components/ui/section";

<Section spacing="comfortable">
  <Stack gap="md">
    <h2>Title</h2>
    <p>Description</p>
  </Stack>
  
  <Inline gap="sm" justify="between">
    <Button>Cancel</Button>
    <Button variant="brand">Save</Button>
  </Inline>
</Section>
```

#### Grid

Responsive grid with automatic column breakpoints.

**Usage**:
```tsx
import { Grid, GridItem } from "@/components/ui/grid";

<Grid cols={3} gap="default">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

{/* 12-column manual layout */}
<Grid cols={12} gap="md">
  <GridItem colSpan={8}>Main content</GridItem>
  <GridItem colSpan={4}>Sidebar</GridItem>
</Grid>
```

### Pattern Components

#### EmptyState

Empty state pattern with optional icon, title, description, and action.

**Usage**:
```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { Home } from "lucide-react";

<EmptyState
  icon={Home}
  title="No properties found"
  description="Get started by adding your first property"
  action={{
    label: "Add Property",
    onClick: () => router.push("/properties/new")
  }}
/>
```

#### LoadingState

Loading state with spinner or skeleton variants.

**Usage**:
```tsx
import { LoadingState, Skeleton } from "@/components/ui/loading-state";

{/* Spinner */}
<LoadingState variant="spinner" size="lg" text="Loading properties..." />

{/* Skeleton */}
<LoadingState variant="skeleton" />

{/* Custom skeleton layout */}
<div className="space-y-4">
  <Skeleton variant="text" className="w-1/2" />
  <Skeleton variant="rectangular" className="h-32" />
  <Skeleton variant="circular" className="size-12" />
</div>
```

#### ErrorState

Error state with retry and support actions.

**Usage**:
```tsx
import { ErrorState } from "@/components/ui/error-state";

<ErrorState
  title="Failed to load properties"
  message="We couldn't retrieve the property list. Please try again."
  onRetry={() => refetch()}
  retryLabel="Retry"
  showSupport
/>
```

#### StatGrid & StatCard

Statistics grid for dashboard metrics.

**Usage**:
```tsx
import { StatGrid, StatCard } from "@/components/ui/stat-grid";
import { Home, Users, DollarSign } from "lucide-react";

<StatGrid cols={4}>
  <StatCard
    icon={Home}
    label="Total Properties"
    value="124"
    variant="brand"
    change={{ value: "+12% from last month", trend: "up" }}
  />
  <StatCard
    icon={Users}
    label="Active Clients"
    value="89"
    variant="success"
  />
  <StatCard
    icon={DollarSign}
    label="Revenue"
    value="€45,231"
    variant="default"
  />
</StatGrid>
```

#### KeyValueList

Key-value pairs with consistent formatting.

**Usage**:
```tsx
import { KeyValueList, KeyValueItem } from "@/components/ui/key-value-list";

<KeyValueList spacing="default">
  <KeyValueItem label="Property Type" value="Apartment" />
  <KeyValueItem label="Bedrooms" value="3" />
  <KeyValueItem label="Price" value="€250,000" />
  <KeyValueItem label="Status" value={<Badge variant="success">Active</Badge>} />
</KeyValueList>

{/* Vertical layout */}
<KeyValueList spacing="comfortable">
  <KeyValueItem label="Description" value="Long text..." layout="vertical" />
</KeyValueList>
```

---

## Accessibility Features

### Keyboard Navigation

- All interactive elements are keyboard-accessible
- Visible focus rings with 2px width and 2px offset
- Focus-visible implementation (no focus on mouse click)
- Proper tab order throughout the application

### ARIA Attributes

- Form inputs have proper `aria-invalid`, `aria-describedby`
- Loading states use `role="status"` and `aria-live="polite"`
- Error states use `role="alert"` and `aria-live="assertive"`
- Icons are marked `aria-hidden="true"` when decorative

### Color Contrast

All text meets WCAG AA standards:
- Body text: 4.5:1 minimum contrast ratio
- Large text (18px+): 3:1 minimum contrast ratio
- Interactive elements: 3:1 against adjacent colors

### Touch Targets

All interactive elements meet 44×44px minimum touch target size (WCAG AAA).

### Reduced Motion

All animations respect `prefers-reduced-motion`:
- Disables scale/transform animations
- Preserves fade opacity changes
- Instant state changes for critical feedback

---

## Usage Guidelines

### Best Practices

1. **Always use semantic tokens**: Prefer `bg-surface` over `bg-white`
2. **Use elevation utilities**: `shadow-e0`, `shadow-e1` instead of arbitrary shadows
3. **Follow spacing rhythm**: Use the 8-point grid system (`space-4`, `space-6`, etc.)
4. **Implement all 5 states**: Every interactive element needs default, hover, focus, active, disabled
5. **Add loading states**: Use `LoadingState` or `Skeleton` for async operations
6. **Provide error fallbacks**: Use `ErrorState` with retry functionality
7. **Include empty states**: Use `EmptyState` for zero-data scenarios

### Anti-Patterns (Avoid)

- ❌ `className="text-blue-500"` → ✅ `className="text-brand"`
- ❌ `className="shadow-md"` → ✅ `className="shadow-e1"` or `elevation="e1"`
- ❌ `className="p-5"` → ✅ Use Card `padding="comfortable"`
- ❌ Hardcoded spacing values → ✅ Use spacing tokens
- ❌ Color-only information → ✅ Pair with icons or text labels

### Component Composition

Build complex UIs by composing primitives:

```tsx
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { Grid } from "@/components/ui/grid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PropertiesPage() {
  return (
    <Container maxWidth="2xl">
      <Section spacing="comfortable">
        <PageHeader
          title="Properties"
          description="Manage your property listings"
          actions={
            <Button variant="brand">Add Property</Button>
          }
        />
        
        <Grid cols={3} gap="default">
          {properties.map(property => (
            <Card key={property.id} elevation="e0" hoverable>
              <CardContent>
                {/* Property details */}
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Section>
    </Container>
  );
}
```

---

## Token Reference Quick Guide

### Color Classes

```css
/* Neutrals */
bg-neutral-1, bg-neutral-2, bg-neutral-3, bg-neutral-6, bg-neutral-9, bg-neutral-11, bg-neutral-12
text-neutral-1, text-neutral-2, ... (same pattern)
border-neutral-6

/* Semantic */
bg-bg, bg-surface
text-text-primary, text-text-secondary
bg-brand, text-brand, border-brand
bg-success, text-success, border-success
bg-warning, text-warning, border-warning
bg-destructive, text-destructive, border-destructive
```

### Spacing Classes

```css
gap-1, gap-2, gap-3, gap-4, gap-6, gap-8, gap-10, gap-12
p-1, p-2, p-3, p-4, p-6, p-8, p-10, p-12
m-1, m-2, m-3, m-4, m-6, m-8, m-10, m-12
space-y-1, space-y-2, space-y-4, space-y-6, space-y-8
```

### Elevation Classes

```css
shadow-e0 /* Flat */
shadow-e1 /* Subtle hover */
shadow-e2 /* Popover */
shadow-e3 /* Modal */
```

### Border Radius Classes

```css
rounded-sm    /* 6px */
rounded       /* 12px */
rounded-lg    /* 16px */
rounded-xl    /* 24px */
rounded-full  /* 9999px */
```

### Motion Classes

```css
duration-micro   /* 120ms */
duration-fast    /* 180ms */
duration-base    /* 240ms */
duration-slow    /* 300ms */

transition-all duration-fast
hover:shadow-e1 transition-all duration-fast
```

---

## Migration from Old Code

When updating existing components:

1. **Replace hardcoded colors**:
   - `bg-white` → `bg-surface`
   - `text-gray-600` → `text-muted-foreground` or `text-text-secondary`
   - `border-gray-200` → `border-border` or `border-neutral-6`

2. **Replace shadow values**:
   - `shadow-sm` → `shadow-e0` or `shadow-e1`
   - `shadow-md` → `shadow-e2`
   - `shadow-lg` → `shadow-e3`

3. **Use enhanced components**:
   - Replace basic `<input>` with `<Input>` component (get error/success states)
   - Replace `<div>` cards with `<Card>` component (get elevation/padding variants)
   - Replace custom loading spinners with `<LoadingState>`

4. **Add missing states**:
   - Ensure all buttons have loading state support
   - Add error boundaries with `<ErrorState>`
   - Add empty states with `<EmptyState>`

---

## Contributing to the Design System

### Adding New Tokens

1. Define primitive token in `styles/globals.css` under `:root` and `.dark`
2. Add semantic mapping if needed
3. Extend Tailwind config in `tailwind.config.ts`
4. Document in this README
5. Update component showcase

### Adding New Components

Before creating a new component:

- [ ] Uses semantic tokens (no hardcoded colors)
- [ ] Implements all 5 states (default, hover, focus, active, disabled)
- [ ] Meets 44×44px touch target minimum
- [ ] Includes focus-visible ring
- [ ] Has reduced-motion fallback
- [ ] Passes AA contrast ratio
- [ ] TypeScript props interface exported
- [ ] Documented in README-UI.md

### Design Review Checklist

- [ ] No `className="text-blue-500"` patterns
- [ ] No `className="shadow-md"` patterns
- [ ] No hardcoded spacing (use spacing tokens)
- [ ] Focus states visible
- [ ] Keyboard navigation functional
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Contrast ratios verified

---

## Support

For questions or issues with the design system:

1. Check this README for token/component documentation
2. Review component source code in `/components/ui/`
3. Check design document at `/docs/design.md` (if exists)
4. Open an issue with label `design-system`

---

**Last Updated**: 2025-10-16  
**Version**: 1.0.0  
**Maintained by**: Oikion Development Team
