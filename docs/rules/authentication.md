# Authentication & Authorization Rules

## Overview
This document defines authentication patterns, authorization strategies, role-based access control (RBAC), and session management for the Oikion application using Auth.js v5 (NextAuth).

## Authentication Stack

### Technology
- **Framework**: Auth.js v5.0.0-beta.19 (NextAuth)
- **Adapter**: Prisma Adapter
- **Session Strategy**: JWT (stateless)
- **Providers**:
  - Google OAuth
  - Email (Magic Link via Resend)
- **Database**: PostgreSQL (User, Account, Session, VerificationToken models)

### Key Files
- [`auth.ts`](../../auth.ts) - Full Auth.js configuration (Node.js runtime)
- [`auth.config.ts`](../../auth.config.ts) - Edge-compatible config (for middleware)
- [`middleware.ts`](../../middleware.ts) - Route protection
- [`lib/session.ts`](../../lib/session.ts) - Session utilities
- [`lib/roles.ts`](../../lib/roles.ts) - Authorization helpers

## Auth.js v5 Configuration

### Split Configuration Pattern

**Why split?**
- **middleware.ts** runs on Edge Runtime (limited Node.js APIs)
- **auth.ts** runs on Node.js runtime (full API access)
- Email provider (Resend) requires Node.js APIs

**Edge Config (auth.config.ts):**
```typescript
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
} satisfies NextAuthConfig;
```

**Full Config (auth.ts):**
```typescript
import authConfig from "@/auth.config";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...authConfig.providers, // Google from edge config
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM!,
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    // Session & JWT callbacks (see below)
  },
  events: {
    // User creation events (see below)
  },
});
```

### Session Extension (TypeScript)

**Type augmentation (types/next-auth.d.ts):**
```typescript
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      organizationId?: string;
      organizationName?: string;
    } & DefaultSession["user"];
  }
}
```

**Session callback:**
```typescript
callbacks: {
  async session({ token, session }) {
    if (session.user) {
      session.user.id = token.sub!;
      session.user.email = token.email!;
      session.user.role = token.role as UserRole;
      session.user.organizationId = token.organizationId as string | undefined;
      session.user.organizationName = token.organizationName as string | undefined;
      session.user.name = token.name;
      session.user.image = token.picture;
    }
    return session;
  },
}
```

### JWT Callback (Sync with Database)

```typescript
callbacks: {
  async jwt({ token }) {
    if (!token.sub) return token;

    // Fetch latest user data from database
    const dbUser = await getUserById(token.sub);

    if (!dbUser) {
      console.error(`User ${token.sub} not found - invalidating session`);
      return null; // Invalidates session
    }

    // Sync token with database
    token.name = dbUser.name;
    token.email = dbUser.email;
    token.picture = dbUser.image;
    token.role = dbUser.role;
    token.organizationId = dbUser.organizationId || undefined;
    token.organizationName = dbUser.organization?.name;

    return token;
  },
}
```

**Why sync?**
- User role changes (promotion/demotion)
- Organization switches
- Profile updates
- Subscription status changes

## User Creation Flow

### Create User Event

**Automatic setup on user registration:**
```typescript
events: {
  async createUser({ user }) {
    if (!user.id || !user.email) return;

    try {
      // 1. Create personal organization (private workspace)
      const personalOrg = await prisma.organization.create({
        data: {
          name: "Private Workspace",
          isPersonal: true,
          plan: "FREE",
        },
      });

      // 2. Create membership for personal org
      await prisma.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: personalOrg.id,
          role: "ORG_OWNER",
        },
      });

      // 3. Check for pending invitation
      const invitation = await prisma.invitation.findFirst({
        where: {
          email: user.email.toLowerCase(),
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
      });

      if (invitation) {
        // User was invited - join invited organization
        await prisma.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: invitation.organizationId,
            role: invitation.role,
          },
        });

        // Set invited org as active
        await prisma.user.update({
          where: { id: user.id },
          data: {
            organizationId: invitation.organizationId,
            role: invitation.role,
          },
        });

        // Mark invitation accepted
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: "ACCEPTED" },
        });
      } else {
        // No invitation - use personal org
        await prisma.user.update({
          where: { id: user.id },
          data: {
            organizationId: personalOrg.id,
            role: "ORG_OWNER",
          },
        });
      }
    } catch (error) {
      console.error("Failed to setup user organization:", error);
    }
  },
}
```

**Setup ensures:**
- Every user has at least one organization (personal workspace)
- Invitation flow works seamlessly
- Users start with appropriate permissions

## Middleware & Route Protection

### Middleware Pattern

```typescript
// middleware.ts
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // App-level password protection (optional)
  const appPassword = process.env.APP_PASSWORD;
  if (appPassword) {
    const isPublic = pathname === "/password-gate" || 
                     pathname.startsWith("/_next") ||
                     pathname.startsWith("/api/auth");
    
    if (!isPublic) {
      const verified = req.cookies.get("app-password-verified")?.value === "true";
      if (!verified) {
        return NextResponse.redirect(new URL("/password-gate", req.url));
      }
    }
  }
  
  // Continue with Auth.js middleware
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Layout-Level Protection

```typescript
// app/(protected)/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function ProtectedLayout({ children }) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return <>{children}</>;
}
```

### Page-Level Protection

```typescript
// app/dashboard/properties/page.tsx
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function PropertiesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  if (!user.organizationId) {
    return <div>No organization found</div>;
  }
  
  // Proceed with page logic
}
```

### Server Action Protection

```typescript
// actions/properties.ts
"use server";

import { auth } from "@/auth";
import { canCreateContent } from "@/lib/roles";

export async function createProperty(data: PropertyFormData) {
  const session = await auth();
  
  // Authentication check
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  
  // Authorization check
  if (!canCreateContent(session.user.role)) {
    return { success: false, error: "Insufficient permissions" };
  }
  
  // Proceed with logic
}
```

## Role-Based Access Control (RBAC)

### Role Hierarchy

```typescript
enum UserRole {
  ORG_OWNER  // Level 4 - Full control
  ADMIN      // Level 3 - Administrative access
  AGENT      // Level 2 - Operational access
  VIEWER     // Level 1 - Read-only
}
```

### Permission Matrix

| Feature | ORG_OWNER | ADMIN | AGENT | VIEWER |
|---------|-----------|-------|-------|--------|
| **Billing** | ✅ Full | ❌ | ❌ | ❌ |
| **Invite Members** | ✅ All roles | ✅ AGENT, VIEWER | ❌ | ❌ |
| **Remove Members** | ✅ Any | ✅ AGENT, VIEWER | ❌ | ❌ |
| **Change Roles** | ✅ Any | ✅ AGENT, VIEWER | ❌ | ❌ |
| **Create Property** | ✅ | ✅ | ✅ | ❌ |
| **Edit Property** | ✅ Any | ✅ Any | ✅ Own | ❌ |
| **Delete Property** | ✅ Any | ✅ Any | ✅ Own | ❌ |
| **Create Client** | ✅ | ✅ | ✅ | ❌ |
| **Edit Client** | ✅ Any | ✅ Any | ✅ Own | ❌ |
| **Delete Client** | ✅ Any | ✅ Any | ✅ Own | ❌ |
| **View Activity Feed** | ✅ | ✅ | ✅ | ✅ |
| **View Reports** | ✅ | ✅ | ✅ | ✅ |

### Authorization Helpers

```typescript
// lib/roles.ts

// Check if user has minimum role level
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const levels = {
    ORG_OWNER: 4,
    ADMIN: 3,
    AGENT: 2,
    VIEWER: 1,
  };
  return levels[userRole] >= levels[requiredRole];
}

// Billing access (ORG_OWNER only)
export function canAccessBilling(role: UserRole): boolean {
  return role === UserRole.ORG_OWNER;
}

// Member management (ORG_OWNER, ADMIN)
export function canManageMembers(role: UserRole): boolean {
  return hasRole(role, UserRole.ADMIN);
}

// Content creation (ORG_OWNER, ADMIN, AGENT)
export function canCreateContent(role: UserRole): boolean {
  return hasRole(role, UserRole.AGENT);
}

// Content deletion (hierarchy + ownership)
export function canDeleteContent(role: UserRole, isOwner: boolean = false): boolean {
  // ORG_OWNER and ADMIN can delete anything
  if (hasRole(role, UserRole.ADMIN)) {
    return true;
  }
  
  // AGENT can only delete own content
  if (role === UserRole.AGENT && isOwner) {
    return true;
  }
  
  return false;
}

// Get roles that user can assign
export function getAssignableRoles(currentUserRole: UserRole): UserRole[] {
  if (currentUserRole === UserRole.ORG_OWNER) {
    return [UserRole.ORG_OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.VIEWER];
  }
  
  if (currentUserRole === UserRole.ADMIN) {
    return [UserRole.AGENT, UserRole.VIEWER];
  }
  
  return [];
}
```

### Usage in Components

```typescript
'use client';

import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { Button } from "@/components/ui/button";

interface PropertyActionsProps {
  user: { id: string; role: UserRole };
  property: { id: string; createdBy: string };
}

export function PropertyActions({ user, property }: PropertyActionsProps) {
  const canCreate = canCreateContent(user.role);
  const canDelete = canDeleteContent(user.role, property.createdBy === user.id);
  
  return (
    <div>
      {canCreate && (
        <Button onClick={handleCreate}>Create Property</Button>
      )}
      
      {canDelete && (
        <Button variant="destructive" onClick={handleDelete}>
          Delete Property
        </Button>
      )}
    </div>
  );
}
```

## Session Management

### Get Current User (Server)

```typescript
// lib/session.ts
import "server-only";
import { cache } from "react";
import { auth } from "@/auth";
import { getUserById } from "@/lib/user";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  
  if (!session?.user?.id) {
    return undefined;
  }
  
  // Verify user exists in database
  const dbUser = await getUserById(session.user.id);
  
  if (!dbUser) {
    console.error(`User ${session.user.id} has valid session but doesn't exist`);
    return undefined;
  }
  
  return session.user;
});
```

**Why cache?**
- Multiple components may call `getCurrentUser()` in same request
- React `cache()` deduplicates calls (called once per request)
- Better performance

### Check Authentication (Client)

```typescript
'use client';

import { useSession } from "next-auth/react";

export function ProfileButton() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <Skeleton />;
  }
  
  if (!session) {
    return <Link href="/login">Sign In</Link>;
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={session.user.image} />
          <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          {session.user.name} ({session.user.role})
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/dashboard/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Sign Out

```typescript
'use client';

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })}>
      Sign Out
    </button>
  );
}
```

## OAuth Providers

### Google OAuth Setup

**1. Create OAuth Credentials:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create project → APIs & Services → Credentials
- Create OAuth 2.0 Client ID
- Add authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (dev)
  - `https://yourdomain.com/api/auth/callback/google` (prod)

**2. Environment Variables:**
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

**3. Configuration:**
```typescript
// auth.config.ts
import Google from "next-auth/providers/google";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Auto-link accounts with same email
    }),
  ],
};
```

## Magic Link (Email) Provider

### Resend Setup

**1. Get API Key:**
- Sign up at [Resend](https://resend.com/)
- Create API key
- Verify domain (for production)

**2. Environment Variables:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM="Oikion <noreply@yourdomain.com>"
```

**3. Custom Email Template:**
```typescript
// lib/email.ts
import { MagicLinkEmail } from "@/emails/magic-link-email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: {
  identifier: string;
  url: string;
  provider: EmailConfig;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: provider.from!,
      to: email,
      subject: "Sign in to Oikion",
      react: MagicLinkEmail({ magicLink: url }),
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
}
```

**4. Email Component:**
```typescript
// emails/magic-link-email.tsx
import { Button, Html, Text } from "@react-email/components";

export function MagicLinkEmail({ magicLink }: { magicLink: string }) {
  return (
    <Html>
      <Text>Click the button below to sign in to Oikion:</Text>
      <Button href={magicLink} style={{ background: "#0070f3", color: "#fff" }}>
        Sign in
      </Button>
      <Text>This link expires in 24 hours.</Text>
      <Text>If you didn't request this, you can safely ignore this email.</Text>
    </Html>
  );
}
```

## Invitation Flow

### 1. Invite User (Server Action)

```typescript
// actions/invitations.ts
"use server";

export async function inviteUser(email: string, role: UserRole) {
  const session = await auth();
  
  if (!canManageMembers(session.user.role)) {
    return { success: false, error: "Insufficient permissions" };
  }
  
  // Generate unique token
  const token = randomBytes(32).toString("hex");
  
  // Create invitation
  const invitation = await prismaForOrg(session.user.organizationId!).invitation.create({
    data: {
      email: email.toLowerCase(),
      role,
      token,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      organizationId: session.user.organizationId!,
      invitedBy: session.user.id!,
    },
  });
  
  // Send invitation email
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${token}`;
  await sendInvitationEmail(email, inviteUrl);
  
  return { success: true, data: invitation };
}
```

### 2. Accept Invitation (Page)

```typescript
// app/(auth)/accept-invite/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  
  if (!token) {
    redirect("/login?error=invalid_invitation");
  }
  
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: true },
  });
  
  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
    redirect("/login?error=expired_invitation");
  }
  
  // Show acceptance UI
  return (
    <div>
      <h1>You've been invited to join {invitation.organization.name}</h1>
      <p>Role: {invitation.role}</p>
      <SignInForm email={invitation.email} />
    </div>
  );
}
```

## Security Best Practices

### 1. Environment Variables

```env
# REQUIRED for Auth.js v5
AUTH_SECRET=generate_with_openssl_rand_base64_32
AUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Email Provider
RESEND_API_KEY=re_xxx
EMAIL_FROM="App Name <noreply@domain.com>"

# Database
DATABASE_URL=postgresql://...
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Secure Cookies

**Auth.js automatically handles:**
- HttpOnly cookies (not accessible via JavaScript)
- Secure cookies (HTTPS only in production)
- SameSite=Lax (CSRF protection)
- Signed JWT tokens

### 3. Session Duration

```typescript
// auth.ts
export const { auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // ...
});
```

### 4. Password Protection (Optional)

**For staging/preview environments:**
```env
APP_PASSWORD=secret123
```

**Middleware enforcement:**
```typescript
// middleware.ts (see full example above)
const appPassword = process.env.APP_PASSWORD;
if (appPassword && !passwordVerified) {
  return NextResponse.redirect(new URL("/password-gate", req.url));
}
```

## Testing Authentication

### 1. Mock Auth in Tests

```typescript
// __tests__/mocks/auth.ts
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

// In tests
import { auth } from "@/auth";

(auth as jest.Mock).mockResolvedValue({
  user: {
    id: "test-user",
    role: "AGENT",
    organizationId: "test-org",
  },
});
```

### 2. Test Protected Routes

```typescript
// __tests__/app/dashboard.test.tsx
import { getCurrentUser } from "@/lib/session";

jest.mock("@/lib/session");

describe("DashboardPage", () => {
  it("redirects if not authenticated", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    
    const { redirect } = await import("next/navigation");
    render(<DashboardPage />);
    
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
```

## Common Patterns

### Check Role in Component

```typescript
import { getCurrentUser } from "@/lib/session";
import { canAccessBilling } from "@/lib/roles";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const canSeeBilling = canAccessBilling(user.role);
  
  return (
    <div>
      <h1>Settings</h1>
      {canSeeBilling && <BillingSection />}
    </div>
  );
}
```

### Conditional UI (Client)

```typescript
'use client';

import { useSession } from "next-auth/react";
import { canCreateContent } from "@/lib/roles";

export function CreateButton() {
  const { data: session } = useSession();
  
  if (!session?.user || !canCreateContent(session.user.role)) {
    return null;
  }
  
  return <Button>Create Property</Button>;
}
```

## Troubleshooting

### Session Not Updating After DB Changes

**Problem**: User role changed in database, but session still shows old role

**Solution**: JWT callback fetches latest data on every request (already implemented)

### User Redirected to Login After Sign-In

**Problem**: Session not persisting

**Solutions:**
1. Check `AUTH_SECRET` is set and consistent
2. Verify cookies are enabled in browser
3. Check HTTPS in production (Secure cookies)
4. Clear browser cookies and try again

### Magic Link Not Working

**Problem**: Email link not signing in user

**Solutions:**
1. Check Resend API key is valid
2. Verify `EMAIL_FROM` domain is verified
3. Check link hasn't expired (24 hours default)
4. Ensure `AUTH_URL` matches your domain

## Related Files

- [`auth.ts`](../../auth.ts) - Auth.js configuration
- [`auth.config.ts`](../../auth.config.ts) - Edge-compatible config
- [`middleware.ts`](../../middleware.ts) - Route protection
- [`lib/session.ts`](../../lib/session.ts) - Session utilities
- [`lib/roles.ts`](../../lib/roles.ts) - Authorization helpers
- [`prisma/schema.prisma`](../../prisma/schema.prisma) - Auth models

## Resources

- [Auth.js v5 Documentation](https://authjs.dev/)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [JWT Strategy Guide](https://authjs.dev/concepts/session-strategies#jwt)
- [RBAC with Auth.js](https://authjs.dev/guides/role-based-access-control)
- [Resend Documentation](https://resend.com/docs)
