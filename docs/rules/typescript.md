# TypeScript Rules & Standards

## Overview
This document defines TypeScript standards, patterns, and best practices for the Oikion codebase. All code must adhere to these rules to maintain type safety, consistency, and developer experience.

## TypeScript Configuration

### Compiler Options (tsconfig.json)
- **Target**: ES5 for maximum compatibility
- **Module**: ESNext for modern JavaScript modules
- **Strict Mode**: Enabled (with `strictNullChecks: true`)
- **JSX**: Preserve (handled by Next.js)
- **Path Aliases**: `@/*` maps to project root
- **Incremental**: Enabled for faster builds

### Version Requirements
- **TypeScript**: 5.5.3 (as per package.json)
- Keep aligned with Next.js 14.2.5 compatibility requirements

## Type Safety Rules

### 1. Explicit Types Required

**Required in:**
- Function parameters (always)
- Function return types (exported functions, server actions, API routes)
- Complex object structures
- Generic type parameters

**Example:**
```typescript
// ✅ CORRECT
async function updateClient(
  id: string,
  data: Partial<Client>
): Promise<{ success: boolean; client?: Client; error?: string }> {
  // ...
}

// ❌ INCORRECT
async function updateClient(id, data) {
  // ...
}
```

### 2. Avoid `any` Type

**Rule**: Never use `any` unless interfacing with untyped third-party libraries. Use `unknown` or proper generics instead.

**Exceptions:**
- Prisma extensions (`as any` for type compatibility)
- Legacy code during migration (mark with `// TODO: Type properly`)

**Example:**
```typescript
// ✅ CORRECT
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data;
  }
  return JSON.stringify(data);
}

// ❌ INCORRECT
function processData(data: any): string {
  return data;
}
```

### 3. Null Safety

**Rules:**
- Use optional chaining (`?.`) for nullable access
- Use nullish coalescing (`??`) for default values
- Always check for null/undefined before using
- Prefer explicit `undefined` over `null` (unless Prisma/DB requires null)

**Example:**
```typescript
// ✅ CORRECT
const userName = user?.name ?? 'Guest';
const orgId = session.user?.organizationId;
if (!orgId) {
  return { error: 'No organization' };
}

// ❌ INCORRECT
const userName = user.name || 'Guest'; // breaks on empty string
const orgId = session.user.organizationId; // might crash
```

## Type Definitions

### 1. Custom Types Location

**Structure:**
```
types/
├── index.d.ts        # Global type augmentations
├── next-auth.d.ts    # Auth.js session extensions
└── [domain].d.ts     # Domain-specific types
```

### 2. Extending Third-Party Types

**Auth.js Session Extension (types/next-auth.d.ts):**
```typescript
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      organizationId: string | null;
    } & DefaultSession["user"];
  }
}
```

**Rule**: Always extend types in declaration files, never in implementation files.

### 3. Prisma Generated Types

**Import Pattern:**
```typescript
import { User, Property, Client, UserRole } from "@prisma/client";
import type { Prisma } from "@prisma/client";
```

**Rules:**
- Import enums directly: `UserRole`, `PropertyType`, etc.
- Import models for return types: `User`, `Property`
- Import `Prisma` namespace for advanced types: `Prisma.PropertyCreateInput`
- Never manually define types that Prisma generates

## Function Signatures

### 1. Server Actions

**Pattern:**
```typescript
import { z } from "zod";

// 1. Define validation schema
const createClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  // ...
});

// 2. Type from schema
type CreateClientInput = z.infer<typeof createClientSchema>;

// 3. Action function with explicit return type
export async function createClient(
  data: CreateClientInput
): Promise<{ success: boolean; client?: Client; error?: string }> {
  // Validation
  const validationResult = createClientSchema.safeParse(data);
  if (!validationResult.success) {
    return { success: false, error: validationResult.error.message };
  }
  
  // Implementation...
}
```

**Return Type Standards:**
```typescript
// Success/Error pattern (preferred)
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Optional data pattern (current)
type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

### 2. React Components

**Server Components:**
```typescript
// ✅ Explicit props interface
interface PropertyListPageProps {
  params: { id: string };
  searchParams: { status?: string; type?: string };
}

export default async function PropertyListPage({ 
  params, 
  searchParams 
}: PropertyListPageProps) {
  // ...
}
```

**Client Components:**
```typescript
'use client';

interface ClientFormProps {
  initialData?: Client;
  onSuccess?: (client: Client) => void;
  onCancel?: () => void;
}

export function ClientForm({ 
  initialData, 
  onSuccess, 
  onCancel 
}: ClientFormProps) {
  // ...
}
```

### 3. Hooks

**Pattern:**
```typescript
import { useState, useEffect } from 'react';

export function useClientData(clientId: string): {
  client: Client | null;
  loading: boolean;
  error: string | null;
} {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Implementation...
  
  return { client, loading, error };
}
```

## Generic Types

### 1. Utility Types Usage

**Prefer built-in utility types:**
```typescript
// Partial updates
type UpdateClientInput = Partial<Client>;

// Pick specific fields
type ClientSummary = Pick<Client, 'id' | 'name' | 'email'>;

// Omit generated fields
type ClientCreateInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;

// Make fields required
type RequiredClient = Required<Pick<Client, 'name' | 'organizationId'>>;
```

### 2. Generic Constraints

```typescript
// ✅ Constrained generic
function findById<T extends { id: string }>(
  items: T[], 
  id: string
): T | undefined {
  return items.find(item => item.id === id);
}

// ✅ Multiple constraints
function createEntity<
  T extends { organizationId: string },
  K extends keyof T
>(data: Pick<T, K>): Promise<T> {
  // ...
}
```

## Enums vs Union Types

### 1. Use Prisma Enums

**Prefer Prisma enums over custom enums:**
```typescript
// ✅ CORRECT - Use Prisma enum
import { UserRole, PropertyStatus } from "@prisma/client";

function checkPermission(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.ORG_OWNER;
}

// ❌ INCORRECT - Don't recreate enums
enum CustomUserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT'
}
```

### 2. Union Types for Non-DB Values

```typescript
// ✅ For app-specific constants
type PageView = 'list' | 'grid' | 'table';
type SortDirection = 'asc' | 'desc';

// ✅ Literal types with const assertion
const ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

type Action = typeof ACTIONS[keyof typeof ACTIONS];
```

## Type Guards

### 1. Type Predicates

```typescript
// ✅ Type guard function
function isClient(entity: Client | Property): entity is Client {
  return 'email' in entity && 'phone' in entity;
}

// Usage
if (isClient(entity)) {
  console.log(entity.email); // TypeScript knows it's Client
}
```

### 2. Discriminated Unions

```typescript
// ✅ Action result with discriminant
type ActionResult<T> = 
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'loading' };

function handleResult<T>(result: ActionResult<T>) {
  switch (result.status) {
    case 'success':
      return result.data; // TypeScript knows data exists
    case 'error':
      return result.error; // TypeScript knows error exists
    case 'loading':
      return null;
  }
}
```

## Async/Promise Types

### 1. Promise Return Types

```typescript
// ✅ Explicit Promise<T>
async function fetchClient(id: string): Promise<Client | null> {
  return await prisma.client.findUnique({ where: { id } });
}

// ✅ Promise<void> for side effects
async function logActivity(action: string): Promise<void> {
  await prisma.activity.create({ data: { ... } });
}
```

### 2. Awaited Type Utility

```typescript
// ✅ Extract resolved type
type ClientResult = Awaited<ReturnType<typeof fetchClient>>;
// ClientResult = Client | null
```

## Type Inference Best Practices

### 1. Let TypeScript Infer When Obvious

```typescript
// ✅ No type needed (inferred)
const count = clients.length;
const names = clients.map(c => c.name);
const isActive = status === PropertyStatus.AVAILABLE;

// ✅ Type needed (not obvious)
const result: ActionResult<Client> = await createClient(data);
```

### 2. Satisfies Operator (TS 4.9+)

```typescript
// ✅ Ensure object satisfies type without widening
const config = {
  apiUrl: '/api',
  timeout: 5000,
  retries: 3,
} satisfies Record<string, string | number>;

// config.apiUrl is string (not string | number)
```

## Error Handling Types

### 1. Error Classes

```typescript
// ✅ Custom error types
export class OrganizationError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'INVALID_DATA'
  ) {
    super(message);
    this.name = 'OrganizationError';
  }
}

// Usage
throw new OrganizationError('Organization not found', 'NOT_FOUND');
```

### 2. Result Types with Errors

```typescript
// ✅ Discriminated union for errors
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseJSON<T>(json: string): Result<T, SyntaxError> {
  try {
    return { ok: true, value: JSON.parse(json) };
  } catch (error) {
    return { ok: false, error: error as SyntaxError };
  }
}
```

## Import/Export Patterns

### 1. Type-Only Imports

```typescript
// ✅ Separate type imports (better tree-shaking)
import type { User, Property } from "@prisma/client";
import type { Session } from "next-auth";

// ✅ Inline type import
import { type UserRole, PropertyStatus } from "@prisma/client";
```

### 2. Barrel Exports (index.ts)

```typescript
// lib/validations/index.ts
export { clientSchema, type ClientInput } from './client';
export { propertySchema, type PropertyInput } from './property';
export type { ValidationResult } from './types';
```

## Common Pitfalls to Avoid

### ❌ Don't Use Assertion Unless Necessary
```typescript
// ❌ BAD
const user = await getUser() as User;

// ✅ GOOD
const user = await getUser();
if (!user) throw new Error('User not found');
// Now TypeScript knows user is defined
```

### ❌ Don't Ignore Compiler Errors
```typescript
// ❌ NEVER DO THIS
// @ts-ignore
const result = dangerousOperation();

// ✅ Fix the type or use proper assertion
const result = dangerousOperation() as ExpectedType;
```

### ❌ Don't Create Redundant Types
```typescript
// ❌ BAD - Duplicates Prisma type
interface MyUser {
  id: string;
  name: string;
  email: string;
}

// ✅ GOOD - Use Prisma type
import type { User } from "@prisma/client";
type UserWithoutPassword = Omit<User, 'password'>;
```

## Zod Integration

### 1. Schema-First Typing

```typescript
import { z } from "zod";

// ✅ Define schema first
export const propertySchema = z.object({
  price: z.number().positive(),
  bedrooms: z.number().int().positive().optional(),
  propertyType: z.nativeEnum(PropertyType),
  status: z.nativeEnum(PropertyStatus),
});

// ✅ Infer types from schema
export type PropertyInput = z.infer<typeof propertySchema>;
export type PropertyOutput = z.output<typeof propertySchema>;
```

### 2. Validation Integration

```typescript
// ✅ Parse with type inference
const parseResult = propertySchema.safeParse(rawData);
if (parseResult.success) {
  const validData: PropertyInput = parseResult.data;
}
```

## Documentation Standards

### 1. TSDoc Comments

```typescript
/**
 * Creates a new client in the organization
 * 
 * @param data - Client creation data
 * @param organizationId - Organization ID to create client in
 * @returns Promise resolving to created client or error
 * 
 * @throws {OrganizationError} When organization not found
 * @throws {ValidationError} When data is invalid
 * 
 * @example
 * ```typescript
 * const result = await createClient({
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * }, 'org_123');
 * ```
 */
export async function createClient(
  data: ClientInput,
  organizationId: string
): Promise<Result<Client>> {
  // ...
}
```

### 2. Type Aliases Documentation

```typescript
/**
 * Represents a client entity with all required fields
 * Used for client management in CRM module
 */
export type ClientEntity = Client & {
  /** Latest interaction timestamp */
  lastInteraction?: Date;
  /** Count of associated properties */
  propertyCount: number;
};
```

## Performance Considerations

### 1. Type Computation Complexity

```typescript
// ❌ Avoid deeply nested conditional types
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// ✅ Use simpler alternatives when possible
type PartialClient = Partial<Client>;
```

### 2. Const Assertions for Performance

```typescript
// ✅ Const assertion prevents type widening
export const CONFIG = {
  maxUploadSize: 5_000_000,
  allowedTypes: ['image/jpeg', 'image/png'],
} as const;

// Type is: { maxUploadSize: 5000000; allowedTypes: readonly ["image/jpeg", "image/png"] }
```

## Testing Type Safety

### 1. Type Tests

```typescript
// tests/types/actions.test-d.ts
import { expectType, expectError } from 'tsd';
import { createClient } from '@/actions/clients';

expectType<Promise<ActionResult<Client>>>(createClient({ name: 'Test' }));
expectError(createClient({ invalid: 'data' }));
```

## Migration Guidelines

### From Untyped to Typed

1. **Add types incrementally**: Start with function signatures
2. **Use `unknown` temporarily**: Replace `any` with `unknown` first
3. **Enable strict gradually**: Start with `strictNullChecks`
4. **Document TODOs**: Mark areas needing proper types

## Related Files

- [`tsconfig.json`](../../tsconfig.json) - TypeScript configuration
- [`types/next-auth.d.ts`](../../types/next-auth.d.ts) - Auth.js type extensions
- [`types/index.d.ts`](../../types/index.d.ts) - Global types
- [`lib/validations/`](../../lib/validations/) - Zod schemas

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Zod Documentation](https://zod.dev/)
- [Prisma TypeScript Guide](https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety)
