# Feedback Optimization Design

## Overview

This design addresses comprehensive user experience improvements through optimized feedback states, loading indicators, error handling, and frontend-backend integration security across the Oikion real-estate management application.

### Strategic Objectives

| Objective | Description | Success Metric |
|-----------|-------------|----------------|
| **Reduce Perceived Wait Times** | Implement skeleton screens and optimistic UI patterns | Users perceive <500ms load times on critical paths |
| **Eliminate Silent Failures** | Surface all errors with user-friendly messaging | Zero operations fail without user notification |
| **Standardize Feedback Patterns** | Consistent toast, loading, and error state behavior | 100% consistency across all CRUD operations |
| **Secure API Integration** | Validate all inputs, authenticate all requests | Zero unauthorized access or invalid data mutations |
| **Improve Accessibility** | ARIA-compliant states, keyboard navigation | WCAG 2.1 AA compliance on all feedback states |

### Current State Analysis

**Strengths:**
- Toast notification system (Sonner) in place
- Loading.tsx convention adopted for route-level states
- Skeleton components available
- Server actions use try-catch with error returns
- Comprehensive state components (Empty, Error, Success states)

**Gaps Identified:**
- Inconsistent error message quality (technical vs user-friendly)
- Missing loading states on some modal forms
- No optimistic UI for immediate feedback
- Generic error boundaries lack contextual recovery
- Inconsistent validation error display patterns
- Missing rate limiting feedback
- No offline state handling

---

## Architecture

### Feedback State Hierarchy

``mermaid
graph TD
    A[User Action] --> B{Action Type}
    B -->|Read| C[Loading State]
    B -->|Write| D[Optimistic UI]
    
    C --> E{Data Fetch}
    E -->|Success| F[Render Content]
    E -->|Empty| G[Empty State]
    E -->|Error| H[Error State]
    
    D --> I{Server Response}
    I -->|Success| J[Toast Success + Revalidate]
    I -->|Validation Error| K[Inline Error Messages]
    I -->|Server Error| L[Toast Error + Rollback]
    I -->|Network Error| M[Retry Pattern]
    
    H --> N[Error Boundary]
    N --> O{Error Type}
    O -->|404| P[Not Found Page]
    O -->|Auth| Q[Redirect to Login]
    O -->|Generic| R[Error State with Retry]
    
    style C fill:#e3f2fd
    style D fill:#fff3e0
    style G fill:#f3e5f5
    style H fill:#ffebee
    style J fill:#e8f5e9
```

### State Component System

| Component | Purpose | Variants | Usage Context |
|-----------|---------|----------|---------------|
| **LoadingState** | Async data fetching indicator | `full`, `inline`, `skeleton` | Route-level, card content, lists |
| **Skeleton** | Layout placeholder during load | `text`, `rectangular`, `circular` | Individual UI elements |
| **EmptyState** | No data scenarios | With/without action CTA | Empty lists, search results |
| **ErrorState** | Failure recovery interface | `full`, `inline` | Failed fetches, boundary errors |
| **Toast** | Transient feedback | `success`, `error`, `info`, `warning` | CRUD confirmations, validation |
| **Progress** | Determinate operations | Linear bar | File uploads, batch operations |

---

## Frontend Feedback System

### Loading State Strategy

#### Route-Level Loading Pattern

Each protected route should implement loading.tsx with skeleton UI matching the page structure.

**Requirements:**
- Mirror actual page layout (header, grid, cards)
- Use semantic skeleton variants (text for headings, rectangular for cards)
- Include ARIA role="status" and aria-live="polite"
- Maintain layout stability (no layout shift on load)

**Current Coverage:**
- Dashboard: Full skeleton with stats grid
- Properties: List skeleton
- Relations: List skeleton
- Billing: Card skeleton
- Charts: Chart placeholders
- OikoSync: Feed skeleton
- Admin: Admin panel skeleton

**Gap Resolution:**
- Add comprehensive loading.tsx for members page
- Enhance settings page skeleton to match form structure
- Implement loading states for all modal forms

#### Component-Level Loading

**Pattern for Modal Forms:**

``mermaid
sequenceDiagram
    participant User
    participant Form
    participant Submit Button
    participant Server Action
    participant Toast
    
    User->>Form: Fill inputs
    User->>Submit Button: Click submit
    Submit Button->>Submit Button: Set isSubmitting=true
    Submit Button->>Submit Button: Disable + Show spinner
    Submit Button->>Server Action: Call action
    
    alt Success
        Server Action-->>Form: {success: true}
        Form->>Toast: Success message
        Form->>Form: Reset + Close modal
    else Validation Error
        Server Action-->>Form: {success: false, errors}
        Form->>Form: Display inline errors
        Submit Button->>Submit Button: Re-enable
    else Server Error
        Server Action-->>Form: {success: false, error}
        Form->>Toast: User-friendly error
        Submit Button->>Submit Button: Re-enable
    end
```

**Required Enhancements:**
- All modals must implement isSubmitting state
- Button loading spinner using existing Button isLoading prop
- Form field disablement during submission
- Error boundary for catastrophic failures

### Error State Patterns

#### Error Message Taxonomy

| Error Type | User Message | Technical Detail | Recovery Action |
|------------|--------------|------------------|-----------------|
| **Authentication** | "Your session has expired. Please sign in again." | Token expired/invalid | Redirect to /login |
| **Authorization** | "You don't have permission to perform this action." | Role check failed | Show upgrade prompt |
| **Validation** | Field-specific messages | Zod validation errors | Inline error display |
| **Not Found** | "The resource you're looking for doesn't exist." | 404 / record not found | Return to list view |
| **Conflict** | "This resource already exists." | Unique constraint violation | Suggest alternatives |
| **Server Error** | "Something went wrong. Please try again." | 500 / unhandled exception | Retry button |
| **Network Error** | "Connection lost. Check your internet." | Fetch failed / timeout | Auto-retry |
| **Rate Limit** | "Too many requests. Please wait X seconds." | 429 rate limit hit | Show countdown timer |

#### Error Boundary Implementation

**Current State:**
- Generic error.tsx in marketing layout
- Missing error boundaries in protected layout
- No granular error recovery

**Required Enhancements:**

``mermaid
graph TD
    A[App Root] --> B[Marketing Layout]
    A --> C[Protected Layout]
    A --> D[Admin Layout]
    
    B --> E[Generic Error Page]
    C --> F[Dashboard Error Boundary]
    C --> G[Properties Error Boundary]
    C --> H[Relations Error Boundary]
    C --> I[Settings Error Boundary]
    
    F --> J{Error Type}
    J -->|Auth| K[Redirect Login]
    J -->|Server| L[Retry + Support]
    J -->|Not Found| M[404 State]
    
    style E fill:#ffebee
    style F fill:#fff3e0
    style K fill:#e3f2fd
    style L fill:#ffebee
    style M fill:#f3e5f5
```

**Implementation Requirements:**
- Create app protected error.tsx with contextual recovery
- Create section-specific error boundaries for Properties, Relations, Settings
- Implement error logging to console in development
- Add "Report Issue" button for server errors

### Toast Notification Standards

**Standardization Requirements:**

| Action | Toast Type | Message Template | Duration |
|--------|-----------|------------------|----------|
| **Create** | Success | "Resource created successfully" | 3s |
| **Update** | Success | "Resource updated successfully" | 3s |
| **Delete** | Success | "Resource deleted" | 3s |
| **Archive** | Success | "Resource archived" | 3s |
| **Validation Error** | Error | "Please check the form for errors" | 5s |
| **Server Error** | Error | "Failed to action. Please try again." | 5s |
| **Network Error** | Error | "Connection lost. Retrying..." | Auto-dismiss |
| **Invite Sent** | Success | "Invitation sent to email" | 3s |
| **Role Changed** | Success | "User role updated to role" | 3s |

**Enhanced Features Needed:**
- Action buttons in toasts (e.g., "Undo" for delete)
- Progress toasts for long operations
- Grouped toasts for batch operations
- Dismissable/persistent options based on severity

### Empty State Guidelines

**Design Principles:**
- Always include an icon relevant to the context
- Provide clear, action-oriented messaging
- Offer primary action when appropriate
- Consider user role in CTA visibility

**Required Coverage:**

| Page/Section | Empty State Message | Primary Action |
|--------------|---------------------|----------------|
| Properties List | "No properties found. Add your first listing to get started." | "Add Property" (if can create) |
| Relations List | "No clients yet. Start building your network." | "Add Client" (if can create) |
| Activity Feed | "No recent activity. Team actions will appear here." | None (passive) |
| Search Results | "No results for 'query'. Try different keywords." | "Clear Filters" |
| Tasks | "No pending tasks. You're all caught up!" | "Create Task" |
| Notes | "No notes yet. Add observations as you work." | "Add Note" |

---

## Backend Integration & Security

### Server Action Error Handling

**Current Pattern:**
1. Session authentication check
2. Permission validation (role-based)
3. Organization membership check
4. Input validation (Zod schemas)
5. Business logic execution
6. Database transaction
7. Activity logging
8. Path revalidation
9. Return success or error object

**Required Improvements:**

| Layer | Current Issue | Required Enhancement |
|-------|--------------|----------------------|
| **Error Returns** | Generic throw new Error | Return structured error objects with codes |
| **Validation Errors** | Not distinguished from server errors | Separate validation errors for inline display |
| **Logging** | Only console.error in some actions | Centralize error logging with context |
| **Retry Logic** | No differentiation of retryable errors | Add isRetryable flag to errors |
| **Rate Limiting** | Not implemented | Add action-level rate limits |

**Standardized Error Response Schema:**

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| success | boolean | Operation outcome | false |
| error | string | User-friendly message | "Failed to create property" |
| errorCode | string | Machine-readable code | "VALIDATION_ERROR" |
| validationErrors | object | Field-level errors | email: "Invalid format" |
| isRetryable | boolean | Can retry safely | true |
| supportId | string | Error tracking ID | "err_abc123" |

### Input Validation Enhancement

**Current State:**
- Zod schemas defined in lib/validations
- Validation happens in server actions via .parse()
- Errors thrown, not returned gracefully

**Required Improvements:**

``mermaid
flowchart LR
    A[Client Input] --> B[Client-Side Validation]
    B -->|Invalid| C[Inline Error Display]
    B -->|Valid| D[Submit to Server Action]
    
    D --> E[Server-Side Validation]
    E -->|Invalid| F[Return Validation Errors]
    E -->|Valid| G[Business Logic]
    
    F --> H[Map to Form Fields]
    G -->|Success| I[Return Success]
    G -->|Fail| J[Return Server Error]
    
    style C fill:#ffebee
    style F fill:#fff3e0
    style I fill:#e8f5e9
    style J fill:#ffebee
```

**Implementation Requirements:**

1. **Dual Validation:**
   - Use same Zod schemas on client (react-hook-form) and server
   - Client validation for immediate feedback
   - Server validation for security (never trust client)

2. **Validation Error Mapping:**
   - Server actions should use .safeParse() instead of .parse()
   - Return field-level errors in structured format
   - Frontend maps errors to form fields via setError()

3. **Enhanced Schemas:**
   - Add custom error messages to all schema fields
   - Implement conditional validation
   - Add sanitization (trim strings, normalize emails)

### Authentication & Authorization Flow

**Security Audit Findings:**

| Risk | Current State | Required Mitigation |
|------|--------------|---------------------|
| **Session Hijacking** | HttpOnly cookies used | Add CSRF tokens for state-changing operations |
| **Privilege Escalation** | Role checks in actions | Add audit logging for role changes |
| **Missing Org Check** | Some actions check, some don't | Enforce org check in all data-access actions |
| **No Rate Limiting** | Unlimited requests | Implement action-level rate limits |
| **Error Information Disclosure** | Generic messages | Maintain generic messages, log details server-side |

**Required Enhancements:**

1. **Centralized Auth Check:**
   - Create reusable requireAuth() utility
   - Returns user + orgId or throws standardized error
   - Reduces boilerplate in actions

2. **Rate Limiting:**
   - Implement per-user, per-action rate limits
   - Use in-memory store with TTL for Alpha
   - Return 429 with retry-after information
   - Display countdown in UI

3. **Audit Logging:**
   - Log all state-changing operations
   - Include user ID, timestamp, action type, entity
   - Success/failure with error code
   - Accessible to ORG_OWNER in admin panel

### API Endpoint Security

**Current API Routes:**
- /api/auth - NextAuth.js handlers
- /api/user - User deletion
- /api/webhooks/stripe - Payment webhooks
- /api/og - Open Graph image generation
- /api/verify-password - App password check

**Security Checklist:**

| Route | Authentication | Input Validation | Rate Limiting | Status |
|-------|----------------|------------------|---------------|--------|
| /api/auth | Built-in | Built-in | Needed | Partial |
| /api/user | Session | Schema | Needed | Partial |
| /api/webhooks/stripe | Signature | Stripe SDK | N/A | Good |
| /api/og | Public | Query params | Needed | Risk |
| /api/verify-password | None | Body check | Critical | Risk |

**Priority Fixes:**

1. **Password Verification API:**
   - Add aggressive rate limiting (3 attempts per 15 min per IP)
   - Implement CAPTCHA after 2 failed attempts
   - Log all attempts for abuse detection

2. **OG Image API:**
   - Add basic rate limiting (100 req/min per IP)
   - Validate and sanitize all query parameters
   - Cache generated images aggressively

3. **General Improvements:**
   - Add request ID to all responses for tracing
   - Implement CORS headers consistently
   - Add security headers (CSP, X-Frame-Options)

---

## Data Flow & State Management

### Optimistic UI Pattern

**Target Pattern:**

``mermaid
sequenceDiagram
    participant User
    participant UI
    participant Cache
    participant Server
    
    User->>UI: Click "Archive Property"
    UI->>Cache: Update local state (archived)
    UI->>UI: Show success toast
    UI->>UI: Update list (remove item)
    UI->>Server: Call archiveProperty()
    
    alt Server Success
        Server-->>UI: success: true
        UI->>Cache: Confirm state
        Note over UI: No additional feedback needed
    else Server Failure
        Server-->>UI: success: false, error
        UI->>Cache: Rollback to previous state
        UI->>UI: Show error toast
        UI->>UI: Restore item in list
    end
```

**Implementation Candidates:**

| Action | Optimistic Behavior | Rollback Trigger |
|--------|---------------------|------------------|
| Archive Property | Remove from list immediately | Server error or not found |
| Archive Client | Remove from list immediately | Server error or not found |
| Complete Task | Mark complete, move to "Done" | Permission denied |
| Add Note | Show in timeline immediately | Validation error |
| Update Client Tags | Show new tags | Duplicate tag error |

**Requirements:**
- Use React state for immediate UI update
- Call server action asynchronously
- On error: revert state + show toast
- On success: silent confirmation

### Server-Side Revalidation

**Optimization Strategy:**

| Route | Current Revalidation | Optimized Approach |
|-------|---------------------|-------------------|
| /dashboard/properties | Full path | Cache tag: properties-list |
| /dashboard/properties/id | Full path | Cache tag: property-id |
| /dashboard/relations | Full path | Cache tag: clients-list |
| /dashboard/oikosync | Full path | On-demand: ISR with 60s stale |

**Implementation:**
- Use Next.js cache tags with revalidateTag()
- Reduce unnecessary re-renders
- Implement stale-while-revalidate for feeds

---

## Page-by-Page Requirements

### Properties Section

#### List Page

| State | Condition | UI Component | User Action |
|-------|-----------|--------------|-------------|
| Loading | Initial fetch | Skeleton grid (3x3) | Wait |
| Empty | No properties | EmptyState + "Add Property" | Navigate to create |
| Populated | Has data | PropertyCard grid | View/filter/sort |
| Error | Fetch failed | ErrorState + Retry | Click retry |
| Filtering | Active filters | Show filter chips + count | Clear filters |

**Missing Implementation:**
- Filter active state visualization
- Sort indicator in column headers
- Pagination loading state

#### Detail Page

| State | Condition | UI Component | User Action |
|-------|-----------|--------------|-------------|
| Loading | Fetching property | Full page skeleton | Wait |
| Not Found | Invalid ID | NotFound state | Return to list |
| Loaded | Valid property | Full details view | Edit/archive |
| Updating | Save in progress | Disable form + spinner | Wait |
| Delete Confirm | Archive clicked | Confirmation dialog | Confirm/cancel |

**Missing Implementation:**
- Optimistic updates for quick edits
- Image upload progress indicator
- Relationship loading states

#### Create/Edit Forms

**Required Feedback:**
- Real-time validation (on blur)
- Character count for description field
- Image upload progress bar
- Unsaved changes warning on navigation

### Relations Section

#### List Page

| State | Condition | UI Component | User Action |
|-------|-----------|--------------|-------------|
| Loading | Initial fetch | Skeleton rows (5 rows) | Wait |
| Empty | No clients | EmptyState + "Add Client" | Navigate to create |
| Populated | Has data | Client table/cards | View/filter |
| Error | Fetch failed | ErrorState + Retry | Click retry |
| Search Active | Query typed | Show results count | Clear search |

**Missing Implementation:**
- Debounced search loading state
- Tag filter loading

#### Detail Page

**Timeline Component:**
- Loading: Skeleton timeline items (5 items)
- Empty: "No interactions yet" message
- Loaded: Chronological timeline with icons
- Adding Item: Optimistic insertion at top
- Error: Inline error in timeline

**Modals:**
- All modals must show loading spinner on submit button
- Form fields disabled during submission
- Toast feedback on success/error
- Modal closes only on success or explicit cancel

### Dashboard Section

#### Overview Page

**Stats Cards:**
- Loading: Skeleton cards (4 cards)
- Error: Individual card error state
- Loaded: Animated count-up for numbers

**Recent Activity Feed:**
- Loading: Skeleton feed items
- Empty: "No recent activity" with illustration
- Loaded: Activity cards with avatars
- Error: Show error state in feed section only

**Missing Implementation:**
- Refresh button with loading state
- Real-time updates (optional: polling every 60s)

### Admin Section

#### Members Page

**List View:**
- Loading: Skeleton member rows
- Empty: "No members yet"
- Loaded: Member cards with role badges

**Invite Modal:**
- Email validation on blur
- Role selection required
- Submit button loading state
- Success: Toast + close + refresh list
- Error: Toast with specific message

**Role Change:**
- Optimistic UI: Update badge immediately
- Confirmation dialog for sensitive changes
- Error rollback: Revert badge + show toast

### Settings Section

#### Organization Settings

**Form States:**
- Pristine: Submit button disabled
- Dirty: Submit button enabled + "Unsaved changes" indicator
- Saving: Button loading spinner
- Saved: Brief success toast + reset dirty state
- Error: Toast + keep form open with errors

#### User Settings

**Name Change:**
- Inline edit with save/cancel buttons
- Loading state on save button
- Optimistic update
- Error rollback

**Email Change:**
- Verification required pattern
- Multi-step feedback

---

## Accessibility Requirements

### ARIA Attributes

| Component | Required ARIA | Purpose |
|-----------|--------------|---------|
| LoadingState | role="status", aria-live="polite" | Announce loading to screen readers |
| ErrorState | role="alert", aria-live="assertive" | Immediately announce errors |
| Toast | role="status", aria-live="polite" | Announce notifications |
| Form Errors | aria-invalid, aria-describedby | Link errors to inputs |
| Disabled Button | aria-disabled, disabled | Prevent interaction + announce |

### Keyboard Navigation

**Requirements:**
- All interactive states accessible via Tab
- Error states focusable when displayed
- Modals trap focus (close on Escape)
- Toast notifications dismissible via keyboard
- Retry buttons clearly labeled and focusable

### Visual Feedback

**Color Independence:**
- Never rely on color alone for state
- Use icons + text for error/success/warning
- Maintain 4.5:1 contrast ratio for text
- Loading states use animation + text

**Motion Sensitivity:**
- Respect prefers-reduced-motion media query
- Provide static alternatives to animations
- Skeleton pulse can be disabled via system preference

---

## Implementation Phases

### Phase 1: Foundation

**Priority: Critical Path Fixes**

| Task | Component/Page | Effort |
|------|---------------|--------|
| Standardize server action error responses | All actions in /actions | 2 days |
| Add missing loading.tsx files | Members, enhanced Settings | 1 day |
| Implement centralized auth utility | lib/auth-utils.ts | 1 day |
| Create error boundary for protected layout | app protected error.tsx | 1 day |
| Enhance toast message consistency | All mutation points | 1 day |

### Phase 2: Enhanced Feedback

**Priority: User Experience**

| Task | Component/Page | Effort |
|------|---------------|--------|
| Add loading states to all modals | Properties, Clients, Interactions | 2 days |
| Implement optimistic UI for archives | Properties, Clients | 1 day |
| Add validation error mapping | All forms | 2 days |
| Create comprehensive empty states | All list views | 1 day |

### Phase 3: Security Hardening

**Priority: Production Readiness**

| Task | Component/Page | Effort |
|------|---------------|--------|
| Implement rate limiting | API routes, server actions | 2 days |
| Add CSRF protection | State-changing operations | 1 day |
| Enhance audit logging | Activity feed, admin panel | 1 day |
| Security headers configuration | Middleware, next.config | 1 day |

### Phase 4: Polish & Testing

**Priority: Quality Assurance**

| Task | Component/Page | Effort |
|------|---------------|--------|
| Accessibility audit & fixes | All pages | 2 days |
| Add unit tests for state components | UI components | 1 day |
| Integration tests for critical paths | Properties, Clients, Auth | 2 days |

---

## Monitoring & Metrics

### Key Performance Indicators

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Time to Interactive (TTI) | <3s on dashboard | Lighthouse |
| First Contentful Paint (FCP) | <1.5s | Web Vitals |
| Error Rate | <0.5% of operations | Error logging |
| User-reported Issues | <2 per week | Support tickets |
| Accessibility Score | >95 | axe DevTools |

### Error Tracking

**Required Instrumentation:**
- Client-side error boundary with error reporting
- Server action error logging with context
- API route error aggregation

**Error Classification:**

| Severity | Definition | Alert Threshold | Response Time |
|----------|-----------|-----------------|---------------|
| **Critical** | Auth failures, data loss | >5 in 10 min | Immediate |
| **High** | CRUD operation failures | >20 in 1 hour | 1 hour |
| **Medium** | Validation errors, search issues | >100 in 1 hour | 1 day |
| **Low** | UI glitches, styling issues | N/A | Weekly review |

### User Feedback Collection

**Mechanisms:**
- In-app feedback button (all error states)
- Session recording on reported issues
- Quarterly UX survey
- Analytics on retry button usage

---

## Design Patterns Reference

### Loading Pattern Decision Tree

``mermaid
graph TD
    A[Need Loading State?] --> B{Data Source?}
    B -->|Server Component| C[Use loading.tsx]
    B -->|Client Fetch| D{Operation Type?}
    
    D -->|Initial Load| E[Skeleton Component]
    D -->|Mutation| F[Button Loading Spinner]
    D -->|Background Refresh| G[Small Spinner + Keep Content]
    
    C --> H{Layout Known?}
    H -->|Yes| I[Skeleton Matching Layout]
    H -->|No| J[Generic Loading State]
    
    E --> K{Content Type?}
    K -->|List| L[Skeleton Rows]
    K -->|Form| M[Skeleton Form Fields]
    K -->|Card| N[Skeleton Card]
    
    style C fill:#e3f2fd
    style E fill:#e3f2fd
    style F fill:#fff3e0
    style G fill:#f3e5f5
```

### Error Handling Decision Matrix

| Error Origin | Error Type | User Feedback | Developer Action |
|--------------|-----------|---------------|------------------|
| **Client Validation** | Missing field | Inline error, prevent submit | N/A (expected) |
| **Server Validation** | Invalid format | Toast + inline errors | Review schema |
| **Authorization** | Permission denied | Toast + disable action | Check role logic |
| **Database** | Constraint violation | User-friendly toast | Log for analysis |
| **Network** | Timeout/disconnect | Retry prompt | Monitor uptime |
| **External API** | Stripe webhook fail | Silent retry + alert | Check logs |
| **Unhandled** | Uncaught exception | Error boundary | Fix immediately |

### Toast vs Inline Error Guide

**Use Toast When:**
- Confirming successful operation
- Reporting unexpected server errors
- Network/connectivity issues
- Background task completion

**Use Inline Error When:**
- Form validation failures
- Field-specific issues
- Real-time validation feedback

**Use Both When:**
- Form submission fails: inline errors for fields + toast for generic failure
- Partial success: toast for overall status + inline for specific issues

---

## Acceptance Criteria

### Definition of Done

- All protected routes have route-level loading.tsx with proper skeletons
- All modal forms implement loading states
- All server actions return standardized error responses
- All CRUD operations show success toasts
- All list pages implement empty states
- All error states include retry functionality
- Form validation errors display inline with ARIA attributes
- Protected layout has error boundary
- Rate limiting implemented on critical API routes
- Password verification API has brute-force protection
- All feedback states pass accessibility audit
- Unit tests cover all state components
- Integration tests validate optimistic UI rollback
- Error tracking instrumented
- Performance metrics meet targets

### User Acceptance Testing Scenarios

1. **Create Property with Network Failure**
   - User submits valid data + network disconnects
   - Show network error toast + retain form data + enable retry

2. **Archive Property Happy Path**
   - User clicks archive on property
   - Property removed from list immediately + success toast + server confirms

3. **Edit Client with Validation Error**
   - User enters invalid email + submits
   - Inline error under email field + submit button re-enabled + form stays open

4. **Search with No Results**
   - User searches for non-existent name
   - Show empty state with illustration + "Clear search" button

5. **Session Expiration**
   - Session expires + user attempts action
   - Redirect to login + preserve return URL + show "Session expired" message
