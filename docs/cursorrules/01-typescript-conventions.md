# TypeScript Conventions & Patterns

## TypeScript Configuration

### Compiler Settings
- Target: ES5 for maximum compatibility
- Module: ESNext with Node resolution
- Strict mode: Partially enabled (strict: false, but strictNullChecks: true)
- JSX: preserve (handled by Next.js)
- Path aliases: @/* maps to root directory

### Type Safety Philosophy
- Prefer type safety over convenience
- Handle null/undefined explicitly (strictNullChecks enabled)
- Avoid type assertions (as) unless absolutely necessary
- Use unknown instead of any for truly dynamic data
- Explicit return types on all exported functions

## Naming Conventions

### Files & Directories
- All files: kebab-case (user-auth-form.tsx, org-prisma.ts)
- Components: kebab-case files, PascalCase exports
- Types files: kebab-case (index.d.ts, next-auth.d.ts)
- Test files: filename.test.ts (if tests exist)

### Types & Interfaces
- Interfaces: PascalCase with descriptive names (UserSession, PropertyFormData)
- Type aliases: PascalCase (ActionResult, OrganizationMember)
- Enums: PascalCase for name, SCREAMING_SNAKE_CASE for values (UserRole.ORG_OWNER)
- Generic parameters: Single uppercase letter or descriptive PascalCase (T, TData, TContext)

### Variables & Functions
- Variables: camelCase (const userId, let isLoading)
- Constants: SCREAMING_SNAKE_CASE if truly immutable config (MAX_FILE_SIZE)
- Functions: camelCase (getUserById, createProperty)
- React Components: PascalCase (UserAuthForm, PropertyCard)
- Hooks: camelCase with "use" prefix (useMediaQuery, useToast)

### Booleans
- Prefix with is/has/should/can for clarity
- isLoading, hasPermission, shouldRender, canEdit

## Type Definitions

### Interface vs Type
- Use interface for object shapes that might be extended
- Use type for unions, intersections, and utility types
- Use interface for React component props
- Use type for function signatures and complex combinations

### Prop Types
- Define props interface/type in same file as component
- Export if reused elsewhere
- Extend HTML element types when wrapping native elements
- Use Omit/Pick to modify existing types

### Function Types
- Explicit return types on all exported functions
- Arrow functions for inline callbacks
- Named functions for top-level exports
- Async functions always return Promise<T>

## Prisma-Generated Types

### Using Prisma Types
- Import from @prisma/client (Property, Client, UserRole)
- Use Prisma.PropertyCreateInput for create operations
- Use Prisma.PropertyUpdateInput for update operations
- Use Prisma.PropertyWhereInput for query filters
- Use Prisma.PropertyInclude for relation includes

### Type Extensions
- Extend Prisma types for additional computed fields
- Never modify generated Prisma types directly
- Create separate type with Prisma type as base

### Enum Handling
- Use Prisma enums directly (UserRole, MarketingStatus, ActionType)
- Import from @prisma/client
- Never recreate enums manually
- Use enum values in Zod schemas for validation

## Zod Schema Patterns

### Schema Definition
- Define schemas in lib/validations/ directory
- One schema per entity/form
- Export both schema and inferred type
- Colocate related schemas in same file

### Type Inference
- Use z.infer<typeof schema> for type extraction
- Export inferred type alongside schema
- Use for function parameters and return types
- Maintain single source of truth

### Schema Composition
- Use .extend() to build on base schemas
- Use .pick() and .omit() for variations
- Use .partial() for optional update schemas
- Use discriminated unions for polymorphic types

## Server Action Types

### ActionResult Pattern
- All server actions return ActionResult<T>
- Success: { success: true, data: T }
- Error: { success: false, error: string, code: ActionErrorCode }
- Never throw errors from server actions
- Always handle both success and error cases

### ActionContext Type
- Provides userId, organizationId, userRole, prisma
- Passed to all action handlers via safeAction wrapper
- Type-safe access to current user context
- Eliminates repetitive auth checks

### Error Codes
- Use ActionErrorCode enum for standardized errors
- UNAUTHORIZED, FORBIDDEN, VALIDATION_ERROR, NOT_FOUND, etc.
- Client can switch on error codes for UX
- Consistent error handling across application

## React Component Types

### Component Props
- Define Props interface for all components
- Use React.FC<Props> or function signature with props: Props
- Extend HTML element types when applicable (React.ButtonHTMLAttributes)
- Use PropsWithChildren for components wrapping children

### Ref Forwarding
- Use React.forwardRef<Element, Props> for ref components
- Properly type the ref parameter
- Common for UI library components
- Essential for form inputs and focusable elements

### Event Handlers
- Use React event types (React.MouseEvent, React.ChangeEvent)
- Generic on specific element (React.MouseEvent<HTMLButtonElement>)
- Avoid plain Event type from DOM
- Consistent typing across all handlers

## Utility Types

### Common Utilities
- Partial<T>: Make all properties optional
- Required<T>: Make all properties required
- Pick<T, K>: Select specific properties
- Omit<T, K>: Exclude specific properties
- Record<K, V>: Object with specific key/value types

### Custom Utilities
- Define project-specific utilities in types/index.d.ts
- Example: WithOrganization<T> adds organizationId
- Example: Nullable<T> allows null values
- Reuse across codebase for consistency

## Async/Await Patterns

### Promise Handling
- Always await async operations
- Return Promise<T> from async functions
- Handle errors with try/catch or .catch()
- Never use .then() chains, prefer async/await

### Error Handling
- Try/catch in server actions
- Return error ActionResult instead of throwing
- Log errors server-side for debugging
- Return user-friendly error messages

## Type Guards & Assertions

### Type Guards
- Create custom type guards for complex checks
- Return type is "value is Type"
- Use for narrowing union types
- Prefer over type assertions

### Type Assertions
- Avoid when possible
- Use only when you know more than TypeScript
- Non-null assertion (!) for values known to exist
- Type casting (as) as last resort

### Discriminated Unions
- Use literal types to discriminate union members
- Common for success/error result types
- TypeScript narrows based on discriminant property
- Exhaustive switch statements with never checks

## Module Declarations

### Global Types
- Define in types/index.d.ts
- Use declare global for global augmentations
- Avoid polluting global namespace
- Document global types thoroughly

### Next.js Extensions
- Extend NextAuth types in types/next-auth.d.ts
- Add custom session properties
- Type-safe access to user context
- Synced with actual session structure

## Import/Export Patterns

### Named Exports
- Prefer named exports over default exports
- Easier to refactor and find usage
- Better tree-shaking in some cases
- Clear API at file level

### Type-Only Imports
- Use import type for type-only imports
- Improves build performance
- Makes intent clear
- Prevents runtime import of types

### Index Files
- Use index.ts to re-export public API
- Hide implementation details
- Cleaner imports for consumers
- Maintain clean boundaries

## Nullability & Optionality

### Handling Undefined
- Use optional chaining (?.) for safe navigation
- Use nullish coalescing (??) for defaults
- Check explicitly when behavior matters
- Document when null vs undefined is significant

### Optional Properties
- Use ? for optional object properties
- Use | undefined when null is not allowed
- Use | null when value might be explicitly null
- Be consistent within same domain

## Constants & Enums

### Const Objects
- Use as const for literal type inference
- Create const objects for sets of related values
- Prevents reassignment and mutation
- Type-safe at compile time

### String Unions
- Prefer string literal unions over enums
- Better for serialization
- No runtime overhead
- Cleaner generated JavaScript

## Performance Considerations

### Type Complexity
- Avoid deeply nested generics
- Limit conditional type depth
- Complex types slow compilation
- Simplify when possible

### Build Time
- Minimize type-only imports impact
- Use skipLibCheck in tsconfig
- Incremental compilation enabled
- Module resolution optimized

## Documentation

### TSDoc Comments
- Use JSDoc/TSDoc for public APIs
- Document complex types thoroughly
- Explain non-obvious constraints
- Include usage in comments

### Type Annotations
- Add return type annotations to exported functions
- Annotate complex expressions for clarity
- Let TypeScript infer simple cases
- Balance explicitness and brevity

## Common Pitfalls to Avoid

### Type Assertions Gone Wrong
- Don't use as to bypass type errors
- Fix the underlying type issue instead
- Type assertions hide real problems
- Use type guards for safe narrowing

### Any Type Creep
- Never use any unless absolutely necessary
- Prefer unknown for dynamic data
- Gradually type third-party APIs
- Code reviews should flag any usage

### Implicit Any
- Enable noImplicitAny in strict mode
- Annotate function parameters
- Don't rely on implicit inference
- Make types explicit at boundaries

### Mutation of Readonly
- Respect readonly and const assertions
- Don't cast away readonly to mutate
- Create new objects instead
- Immutable patterns throughout

## Best Practices Summary

1. Always use strict null checking
2. Explicit return types on exported functions
3. Prefer interfaces for object shapes
4. Use Prisma types directly, don't recreate
5. Zod schemas as single source of validation
6. ActionResult pattern for all server actions
7. Named exports over default exports
8. Type-only imports where applicable
9. Document complex types with TSDoc
10. Let TypeScript infer when obvious

## TypeScript Version

Current: 5.5.3
Update Strategy: Follow Next.js compatibility
Breaking Changes: Review changelog before upgrading

