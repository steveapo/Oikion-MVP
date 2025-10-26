# UI Components Architecture & Patterns

## Component Organization

### Directory Structure
- components/ui/: shadcn/ui primitives (button, input, dialog)
- components/shared/: Reusable cross-feature components
- components/forms/: Form-specific components
- components/dashboard/: Dashboard-specific components
- components/{feature}/: Feature-specific components (properties, relations, members)

### File Naming
- kebab-case for all component files
- Match component name (UserAuthForm → user-auth-form.tsx)
- One component per file typically
- Collocate related components in same file if tightly coupled
- Index files for clean exports

## shadcn/ui Components

### Installation Pattern
- Install via shadcn/ui CLI
- Components added to components/ui/
- Customizable and owned by project
- Based on Radix UI primitives
- Styled with Tailwind CSS

### Available Components
- button, input, select, textarea: Form controls
- dialog, sheet, popover: Overlays
- dropdown-menu, context-menu: Menus
- toast: Notifications via sonner
- card, separator, tabs: Layout
- accordion, collapsible: Disclosure
- Many more in components/ui/

### Customization
- Edit components directly (you own the code)
- Extend variants with CVA
- Add new variants to existing components
- Maintain consistency with design system
- Document custom additions

## Component Variants (CVA)

### Class Variance Authority
- Define variants object in CVA call
- Variants for size, color, state
- Compound variants for combinations
- defaultVariants for common case
- Type-safe with VariantProps

### Button Example Pattern
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- Rounded: default, sm, lg, xl, 2xl, full
- Export buttonVariants for reuse
- Extend in other components

### Creating Variant Components
- Use cva() function
- Base classes first argument
- Variants object second argument
- Combine with cn() utility
- Export variant type for props

## Server vs Client Components

### Server Component Default
- All components Server by default
- No "use client" directive
- Can async fetch data
- Direct database access
- No hooks or interactivity

### When to Add "use client"
- Event handlers needed (onClick, onChange)
- React hooks required (useState, useEffect)
- Browser APIs accessed (localStorage, window)
- Third-party client libraries
- Context consumers (but provide at server level)

### Composition Pattern
- Server Component wraps Client Components
- Pass data as props to Client Components
- Keep "use client" boundary small
- Push client directive down tree
- Minimize client JavaScript bundle

## Skeleton Components

### Loading States
- Match real component layout
- Same spacing and structure
- Use Skeleton primitive from ui/
- Provide visual feedback
- Consistent with design system

### Pattern
- Separate skeleton component file
- Same props as real component
- Used in loading.tsx files
- Can be used in Suspense fallback
- Reusable across features

### Examples
- PropertyCardSkeleton
- RecentClientsSkeleton
- MembersListSkeleton
- Match card dimensions
- Match grid/list layout

## Form Components

### Form Control Pattern
- Wrap native inputs with form context
- Use React Hook Form Controller
- Display validation errors inline
- Label always associated with input
- Accessible by default

### Form Layout
- Consistent spacing
- Clear visual hierarchy
- Group related fields
- Error message placement
- Submit button positioning

### Form Composition
- FormField wraps control
- FormItem provides spacing
- FormLabel, FormControl, FormMessage
- FormDescription for help text
- Reusable pattern throughout

## Modal & Dialog Patterns

### Dialog Component
- Use Dialog primitive from ui/
- DialogContent, DialogHeader, DialogTitle
- DialogDescription for accessibility
- DialogFooter for actions
- Close button always present

### Sheet Component
- Slide-in panel variant
- Used for filters, details
- SheetContent, SheetHeader, SheetTitle
- SheetDescription, SheetFooter
- Direction variants (right, left, top, bottom)

### Modal Management
- State managed by parent
- Open prop controlled
- onOpenChange callback
- Can use useRouter for URL-based modals
- Form submission closes modal

## List & Grid Components

### List Pattern
- Map over data array
- Key on unique ID
- Separate item component
- Consistent item spacing
- Empty state handling

### Grid Layout
- Responsive grid with Tailwind
- grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- gap utilities for spacing
- Consistent card sizes
- Skeleton for loading

### Virtual Lists
- Not implemented currently
- Consider for very long lists (>1000 items)
- react-window or similar
- Maintain performance
- Infinite scroll alternative

## Card Components

### Card Structure
- Card primitive from ui/
- CardHeader, CardTitle, CardDescription
- CardContent for main content
- CardFooter for actions
- Consistent padding

### Feature Cards
- PropertyCard, ContactCard, etc.
- Image at top if applicable
- Title and metadata
- Action buttons in footer
- Hover states for interactivity

### Dashboard Cards
- InfoCard for metrics
- Chart cards for visualizations
- Consistent heights where appropriate
- Responsive sizing
- Loading skeletons

## Data Display

### Tables
- Not heavily used currently
- Use table primitive from ui/ if needed
- Responsive table patterns
- Sorting and filtering
- Pagination

### Charts
- Recharts library
- Chart components in components/charts/
- Responsive container
- Consistent colors from theme
- Loading states

### Empty States
- Meaningful message
- Icon or illustration
- Call to action if applicable
- Encouraging tone
- Consistent styling

## Icon Usage

### Lucide React
- Import specific icons
- Tree-shaking for optimal bundle
- Consistent sizing (size prop)
- Use theme colors (className)
- Semantic icon choices

### Icon Patterns
- size="16" or size="20" for inline
- size="24" for standalone
- Use with sr-only text for accessibility
- Icon buttons with tooltip
- Consistent usage across app

## Responsive Design

### Breakpoints
- Tailwind default breakpoints
- sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
- Mobile-first approach
- Stack on small screens
- Side-by-side on larger

### Responsive Patterns
- Hidden on mobile: hidden md:block
- Mobile menu: Navigation drawer
- Responsive grids: grid-cols-1 md:grid-cols-2
- Fluid typography: text-sm md:text-base
- Responsive spacing: p-4 md:p-6

## Accessibility

### ARIA Labels
- aria-label for icon buttons
- aria-labelledby for complex components
- aria-describedby for descriptions
- role attributes where needed
- Landmark regions

### Keyboard Navigation
- Focusable interactive elements
- Logical tab order
- Visible focus indicators
- Escape to close modals
- Enter to submit forms

### Screen Reader Support
- Semantic HTML elements
- sr-only utility for screen reader text
- Live regions for dynamic content
- Skip links for navigation
- Test with screen reader

## Animation & Transitions

### Tailwind Animations
- tailwindcss-animate plugin
- Predefined animations: spin, ping, pulse, bounce
- Custom animations in tailwind.config.ts
- animate-in and animate-out
- CSS transitions for hovers

### Framer Motion
- Not heavily used currently
- Available if complex animations needed
- useSpring, useMotionValue for advanced
- Keep animations subtle
- Performance considerations

## Dark Mode Support

### Theme Implementation
- next-themes for theme management
- Dark mode class strategy
- CSS variables for colors
- Toggle in UI (mode-toggle component)
- Respect system preference

### Color Classes
- Use theme colors (bg-background, text-foreground)
- Automatic dark mode support
- Custom colors use dark: variant
- Test both themes
- Consistent contrast ratios

## Loading States

### Suspense Boundaries
- Wrap async components
- Provide fallback skeleton
- Granular suspense boundaries
- Progressive loading
- Streaming from server

### Pending States
- useFormStatus in forms
- isPending from useTransition
- Disabled state on buttons
- Loading spinners
- Optimistic updates

## Error Boundaries

### Error Display
- Error component at page level
- error.tsx catches errors
- Friendly error message
- Reset button to retry
- Log errors for monitoring

### Validation Errors
- Inline field errors
- Summary at top of form
- Highlight invalid fields
- Clear on correction
- Success feedback

## Component Composition

### Compound Components
- Related components work together
- Shared context between components
- Flexible composition
- Example: Card with CardHeader, CardContent
- Clear API for consumers

### Render Props
- Rarely used pattern
- Prefer composition
- Use when sharing logic needed
- Children as function
- Type-safe with TypeScript

### Higher-Order Components
- Avoid in favor of hooks and composition
- Legacy pattern
- Hooks solve same problems better
- Server Components change needs

## Performance Optimization

### Code Splitting
- Dynamic imports for heavy components
- next/dynamic for Client Components
- Loading component while loading
- Reduce initial bundle
- Split by route automatically

### Memoization
- React.memo for expensive renders
- useMemo for expensive calculations
- useCallback for stable function references
- Don't overuse (measure first)
- Server Components don't need memoization

### Image Optimization
- Always use next/image
- Provide width and height
- Use priority for above fold
- Lazy load by default
- Responsive sizes

## Styling Best Practices

### Tailwind Usage
- Utility-first approach
- Compose utilities for components
- Extract repeated patterns to components
- Use @apply sparingly in CSS
- Keep Tailwind in JSX

### CSS Variables
- Theme colors in CSS variables
- Defined in globals.css
- Light and dark mode values
- Accessible via Tailwind
- Consistent across app

### Custom Styles
- Avoid inline styles
- Use Tailwind utilities first
- Custom CSS for complex needs
- Keep styles colocated
- Document custom styles

## Component Documentation

### Props Interface
- Document all props
- Mark required vs optional
- Default values clear
- Examples in comments
- Type-safe with TypeScript

### Usage Examples
- Show common use cases
- Document edge cases
- Error handling examples
- Accessibility notes
- Integration with forms/actions

## Common Patterns

### Async Server Components
- Fetch data directly in component
- Throw error if fails (caught by error boundary)
- No loading state needed (loading.tsx)
- Type-safe with Prisma types
- Cache expensive queries

### Client Form Components
- "use client" directive
- React Hook Form integration
- Zod schema validation
- Call server action on submit
- Handle success/error

### Skeleton Loading
- Match real component structure
- Used in loading.tsx
- Suspense fallback
- Consistent dimensions
- Smooth transition to real content

## Testing Approach

### Manual Testing
- Test interactive features
- Verify responsive design
- Check dark mode
- Test keyboard navigation
- Validate accessibility

### Visual Regression
- Not implemented currently
- Consider for design system
- Automated screenshot comparison
- Catch unintended changes

## Best Practices Summary

1. Default to Server Components
2. Add "use client" only when needed
3. Use shadcn/ui components as foundation
4. Create feature-specific components for domain logic
5. Provide skeleton loading states
6. Support dark mode throughout
7. Follow accessibility guidelines
8. Optimize images with next/image
9. Use CVA for component variants
10. Document complex component APIs

## Version Information

React: 18.3.1
shadcn/ui: Latest (community maintained)
Radix UI: Various versions per component
Tailwind CSS: 3.4.6

