# Naming Conventions

<cite>
**Referenced Files in This Document**   
- [update-user-name.ts](file://actions/update-user-name.ts)
- [user-auth-form.tsx](file://components/forms/user-auth-form.tsx)
- [user-name-form.tsx](file://components/forms/user-name-form.tsx)
- [user-avatar.tsx](file://components/shared/user-avatar.tsx)
- [use-media-query.ts](file://hooks/use-media-query.ts)
- [site.ts](file://config/site.ts)
- [user.ts](file://lib/user.ts)
- [index.d.ts](file://types/index.d.ts)
- [next-auth.d.ts](file://types/next-auth.d.ts)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [File Naming Conventions](#file-naming-conventions)
3. [Component Naming Standards](#component-naming-standards)
4. [Server Actions and API Routes](#server-actions-and-api-routes)
5. [Configuration and Utility Files](#configuration-and-utility-files)
6. [TypeScript Interfaces and Type Aliases](#typescript-interfaces-and-type-aliases)
7. [Hooks and Utility Functions](#hooks-and-utility-functions)
8. [Test Files and Naming Consistency](#test-files-and-naming-consistency)
9. [Semantic Naming for Maintainability](#semantic-naming-for-maintainability)
10. [Tooling Integration](#tooling-integration)
11. [Conclusion](#conclusion)

## Introduction
This document outlines the comprehensive naming conventions adopted in the Next.js SaaS Stripe Starter project. The conventions are designed to ensure code consistency, improve readability, and enhance team collaboration across all code artifacts. The project follows a systematic approach to naming that aligns with industry best practices while maintaining specificity to the Next.js 14 App Router architecture and TypeScript ecosystem.

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L262-L284)

## File Naming Conventions
The project employs kebab-case for all file names, ensuring consistency across the codebase. This convention is applied to all file types including components, utilities, configurations, and server actions. Examples include `user-auth-form.tsx`, `update-user-name.ts`, and `use-media-query.ts`. This approach provides clear visual separation between words and enhances file discoverability in both the file system and code editor.

The kebab-case pattern is consistently applied across all directories:
- Component files: `dashboard-sidebar.tsx`, `pricing-cards.tsx`
- Hook files: `use-intersection-observer.ts`, `use-local-storage.ts`
- Configuration files: `site.ts`, `subscriptions.ts`
- Server actions: `generate-user-stripe.ts`, `open-customer-portal.ts`

This uniform approach eliminates ambiguity and ensures that developers can quickly identify file types and purposes based on their names alone.

**Section sources**
- [user-auth-form.tsx](file://components/forms/user-auth-form.tsx)
- [update-user-name.ts](file://actions/update-user-name.ts)
- [use-media-query.ts](file://hooks/use-media-query.ts)

## Component Naming Standards
React components follow PascalCase naming convention, clearly distinguishing them from other file types and variables. This pattern is consistently applied across all component files, such as `UserAuthForm`, `UserNameForm`, and `UserAvatar`. The PascalCase convention aligns with React's requirement that component names must start with a capital letter and provides immediate visual identification of UI components.

Component names are semantically meaningful and descriptive, reflecting their purpose and functionality:
- Form components: `UserNameForm`, `UserRoleForm`, `BillingFormButton`
- Layout components: `DashboardSidebar`, `MobileNav`, `SiteFooter`
- UI components: `CardSkeleton`, `SectionSkeleton`, `EmptyPlaceholder`

This approach enhances code readability and makes it easier for developers to understand the component's role within the application architecture.

**Section sources**
- [user-auth-form.tsx](file://components/forms/user-auth-form.tsx)
- [user-name-form.tsx](file://components/forms/user-name-form.tsx)
- [user-avatar.tsx](file://components/shared/user-avatar.tsx)

## Server Actions and API Routes
Server actions follow a descriptive kebab-case naming pattern that clearly communicates their purpose and functionality. Examples include `update-user-name.ts`, `update-user-role.ts`, and `generate-user-stripe.ts`. These names use verb-noun patterns that describe the action being performed and the entity being affected, making their purpose immediately clear.

API routes follow a similar naming convention with additional structural patterns:
- Authentication routes: `api/auth/[...nextauth]/route.ts`
- User routes: `api/user/route.ts`
- Webhook routes: `api/webhooks/stripe/route.ts`

The dynamic route segments use Next.js bracket notation (`[slug]`, `[...nextauth]`) while maintaining kebab-case for static segments. This combination provides both flexibility and consistency in API route naming.

**Section sources**
- [update-user-name.ts](file://actions/update-user-name.ts)
- [route.ts](file://app/api/user/route.ts)
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L617-L624)

## Configuration and Utility Files
Configuration files use descriptive kebab-case names that clearly indicate their purpose and scope. The project includes configuration files such as `site.ts`, `blog.ts`, `dashboard.ts`, and `subscriptions.ts`. These names are concise yet descriptive, allowing developers to quickly identify the configuration domain.

Utility files follow similar naming patterns:
- Validation utilities: `auth.ts`, `og.ts`, `user.ts` in the `lib/validations/` directory
- Core utilities: `db.ts`, `email.ts`, `stripe.ts`, `user.ts` in the `lib/` directory
- Type definitions: `index.d.ts`, `next-auth.d.ts` in the `types/` directory

This consistent approach ensures that configuration and utility files are easily discoverable and their purposes are immediately apparent from their names.

**Section sources**
- [site.ts](file://config/site.ts)
- [user.ts](file://lib/user.ts)
- [index.d.ts](file://types/index.d.ts)

## TypeScript Interfaces and Type Aliases
TypeScript interfaces and type aliases follow PascalCase naming convention, consistent with standard TypeScript practices. The project defines types such as `SiteConfig`, `SubscriptionPlan`, `UserSubscriptionPlan`, and `ExtendedUser`. These names are descriptive and follow the pattern of combining relevant terms to create meaningful type names.

Interface properties use camelCase for naming, aligning with JavaScript conventions:
- `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`
- `isPaid`, `isCanceled`, `interval`
- `userNameSchema` (for Zod validation schema)

The type definitions are organized in the `types/` directory with clear separation between core application types and authentication-specific types, enhancing maintainability and discoverability.

**Section sources**
- [index.d.ts](file://types/index.d.ts)
- [next-auth.d.ts](file://types/next-auth.d.ts)
- [user.ts](file://lib/user.ts)

## Hooks and Utility Functions
Custom React hooks follow the `use-camel-case` naming convention, starting with `use` followed by a descriptive name in camelCase. Examples include `useIntersectionObserver`, `useLocalStorage`, `useMediaQuery`, and `useScroll`. This pattern aligns with React's naming convention for hooks and makes it immediately clear that these functions are custom hooks that may use React state and lifecycle features.

Utility functions in the `lib/` directory follow camelCase naming:
- `getUserByEmail`, `getUserById` in `user.ts`
- `constructMetadata`, `formatDate`, `absoluteUrl` in `utils.ts`
- `userNameSchema` for validation schema

This consistent approach ensures that developers can quickly identify the purpose and usage patterns of these functions based on their names and location.

**Section sources**
- [use-media-query.ts](file://hooks/use-media-query.ts)
- [user.ts](file://lib/user.ts)
- [utils.ts](file://lib/utils.ts)

## Test Files and Naming Consistency
While test files are not explicitly shown in the provided structure, the naming conventions suggest that test files would follow the pattern of appending `.test.ts` or `.spec.ts` to the original file name. For example, `update-user-name.test.ts` would correspond to `update-user-name.ts`, and `user-auth-form.test.tsx` would correspond to `user-auth-form.tsx`.

This approach maintains consistency with the project's overall naming strategy by:
- Using kebab-case for the test file names
- Preserving the original file name as the base
- Appending a clear test indicator (`.test` or `.spec`)
- Maintaining the appropriate file extension (`.ts` or `.tsx`)

This pattern ensures that test files are easily associated with their corresponding implementation files, facilitating navigation and maintenance.

**Section sources**
- [update-user-name.ts](file://actions/update-user-name.ts)
- [user-auth-form.tsx](file://components/forms/user-auth-form.tsx)

## Semantic Naming for Maintainability
The project emphasizes semantic naming across all code artifacts to enhance maintainability and team collaboration. Names are chosen to be descriptive and meaningful, avoiding abbreviations and cryptic acronyms. This approach ensures that code remains understandable even as the team grows or new developers join the project.

Key principles of semantic naming in this project:
- **Descriptive verbs in server actions**: `update`, `generate`, `open` clearly indicate the action being performed
- **Specific component names**: `UserAuthForm` rather than `Form`, `DashboardSidebar` rather than `Sidebar`
- **Contextual configuration names**: `site.ts` for site-wide configuration, `blog.ts` for blog-specific settings
- **Clear type names**: `UserSubscriptionPlan` rather than `Plan`, `ExtendedUser` rather than `UserWithRole`

This focus on semantic naming reduces cognitive load for developers and minimizes the need for extensive documentation to understand code functionality.

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L216-L225)
- [site.ts](file://config/site.ts)
- [index.d.ts](file://types/index.d.ts)

## Tooling Integration
The naming conventions are designed to work seamlessly with development tooling, enhancing productivity and code quality. The consistent patterns enable effective use of editor features such as autocomplete, find-as-you-type, and refactoring tools.

Key tooling integrations:
- **ESLint**: Configuration enforces naming conventions and flags deviations
- **Prettier**: Formatting rules support the established naming patterns
- **TypeScript**: Provides autocomplete and type checking for consistently named interfaces and types
- **Editor autocomplete**: Predictable naming patterns enhance code completion accuracy

The use of path aliases (`@/*`) in imports works in conjunction with the naming conventions to provide clear, consistent import statements that are easy to read and maintain.

**Section sources**
- [QODER_AGENT_RULES.md](file://QODER_AGENT_RULES.md#L216-L225)
- [tsconfig.json](file://tsconfig.json)
- [prettier.config.js](file://prettier.config.js)

## Conclusion
The naming conventions in the Next.js SaaS Stripe Starter project provide a comprehensive, consistent framework for all code artifacts. By adhering to kebab-case for files and PascalCase for components and types, the project establishes clear patterns that enhance readability, maintainability, and team collaboration. The semantic naming approach ensures that code remains self-documenting, while the integration with development tooling maximizes developer productivity. These conventions represent a balanced approach that follows industry best practices while addressing the specific needs of a Next.js 14 SaaS application with TypeScript, Prisma, and Stripe integration.