# Stripe Integration & Billing Rules

## Overview
This document defines Stripe payment integration patterns, subscription management, webhook handling, and billing workflows for the Oikion SaaS application.

## Stripe Stack

### Technology
- **Stripe SDK**: stripe 15.12+ (Node.js)
- **Integration Type**: Checkout + Customer Portal
- **Billing Model**: Subscription-based (recurring)
- **Products**: PRO (Monthly/Yearly), BUSINESS (Monthly/Yearly)
- **Webhook Handling**: Signature verification + idempotent processing

### Key Files
- [`lib/stripe.ts`](../../lib/stripe.ts) - Stripe client initialization
- [`lib/subscription.ts`](../../lib/subscription.ts) - Subscription utilities
- [`actions/generate-user-stripe.ts`](../../actions/generate-user-stripe.ts) - Checkout session
- [`actions/open-customer-portal.ts`](../../actions/open-customer-portal.ts) - Portal access
- [`app/api/webhooks/stripe/route.ts`](../../app/api/webhooks/stripe/route.ts) - Webhook handler
- [`env.mjs`](../../env.mjs) - Stripe environment variables

## Stripe Client Setup

### Initialization

```typescript
// lib/stripe.ts
import Stripe from "stripe";
import { env } from "@/env.mjs";

export const stripe = new Stripe(env.STRIPE_API_KEY, {
  apiVersion: "2024-04-10", // Pin version for stability
  typescript: true, // Type-safe responses
});
```

**Why pin API version?**
- Prevents breaking changes from Stripe updates
- Ensures consistent behavior across deployments
- Allows gradual migration to new API versions

### Environment Variables

```env
# Server-side (SECRET - never expose)
STRIPE_API_KEY=sk_test_xxxxx  # Test: sk_test_, Live: sk_live_
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Client-side (PUBLIC - safe to expose)
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID=price_xxxxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Environment Configuration (env.mjs):**
```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    STRIPE_API_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID: z.string().min(1),
  },
  runtimeEnv: {
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
  },
});
```

## Checkout Flow

### 1. Create Checkout Session (Server Action)

```typescript
// actions/generate-user-stripe.ts
"use server";

import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { env } from "@/env.mjs";

export async function generateUserStripe(priceId: string) {
  const session = await auth();
  
  if (!session?.user?.id || !session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    let customerId = user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to database
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId: user.id,
      },
    });

    return { url: checkoutSession.url };
  } catch (error) {
    console.error("Stripe checkout error:", error);
    throw new Error("Failed to create checkout session");
  }
}
```

### 2. Trigger Checkout (Client Component)

```typescript
// components/pricing/pricing-card.tsx
'use client';

import { Button } from "@/components/ui/button";
import { generateUserStripe } from "@/actions/generate-user-stripe";
import { toast } from "sonner";

interface PricingCardProps {
  priceId: string;
  planName: string;
  price: string;
}

export function PricingCard({ priceId, planName, price }: PricingCardProps) {
  async function handleSubscribe() {
    try {
      const result = await generateUserStripe(priceId);
      
      if (result.url) {
        window.location.href = result.url; // Redirect to Stripe Checkout
      }
    } catch (error) {
      toast.error("Failed to start checkout");
    }
  }
  
  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-2xl font-bold">{planName}</h3>
      <p className="text-3xl font-bold mt-4">{price}</p>
      <Button onClick={handleSubscribe} className="w-full mt-4">
        Subscribe to {planName}
      </Button>
    </div>
  );
}
```

### 3. Success/Cancel Handling

```typescript
// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const user = await getCurrentUser();
  
  // Check if coming from successful checkout
  if (searchParams.session_id) {
    // Show success message
    return (
      <div>
        <h1>Welcome! Your subscription is being activated.</h1>
        <p>You'll have access once the payment is confirmed.</p>
      </div>
    );
  }
  
  // Regular dashboard
  return <DashboardContent user={user} />;
}
```

## Customer Portal

### 1. Open Portal (Server Action)

```typescript
// actions/open-customer-portal.ts
"use server";

import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { env } from "@/env.mjs";

export async function openCustomerPortal() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.stripeCustomerId) {
    throw new Error("No Stripe customer found");
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    });

    return { url: portalSession.url };
  } catch (error) {
    console.error("Stripe portal error:", error);
    throw new Error("Failed to open customer portal");
  }
}
```

### 2. Portal Button (Client Component)

```typescript
// components/forms/customer-portal-button.tsx
'use client';

import { Button } from "@/components/ui/button";
import { openCustomerPortal } from "@/actions/open-customer-portal";
import { toast } from "sonner";

export function CustomerPortalButton() {
  async function handleClick() {
    try {
      const result = await openCustomerPortal();
      
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error("Failed to open billing portal");
    }
  }
  
  return (
    <Button onClick={handleClick} variant="outline">
      Manage Subscription
    </Button>
  );
}
```

**Customer Portal Features:**
- Update payment method
- View invoices
- Cancel subscription
- Update billing address
- Download receipts

## Webhook Handler

### 1. Webhook Endpoint

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { env } from "@/env.mjs";

export async function POST(req: Request) {
  // 1. Get raw body (REQUIRED for signature verification)
  const body = await req.text();
  const signature = headers().get("Stripe-Signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  let event;

  try {
    // 2. Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 3. Handle events
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // 4. ALWAYS return 200 (acknowledge receipt)
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Webhook handler error:", error);
    // Still return 200 to prevent retries
    return new Response(null, { status: 200 });
  }
}

async function handleCheckoutCompleted(session: any) {
  console.log("✅ Checkout completed:", session.id);

  // Retrieve full subscription details
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Update user with subscription details
  await prisma.user.update({
    where: { id: session?.metadata?.userId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handlePaymentSucceeded(invoice: any) {
  console.log("✅ Payment succeeded:", invoice.id);

  // Skip subscription_create (handled by checkout.session.completed)
  if (invoice.billing_reason === "subscription_create") {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );

  // Update subscription details
  await prisma.user.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handlePaymentFailed(invoice: any) {
  console.log("❌ Payment failed:", invoice.id);

  // Optionally: Send notification to user
  // Stripe will automatically retry failed payments
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log("🔄 Subscription updated:", subscription.id);

  await prisma.user.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log("🗑️ Subscription deleted:", subscription.id);

  // Clear subscription data
  await prisma.user.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    },
  });
}
```

### 2. Webhook Setup (Stripe Dashboard)

**Test Mode:**
```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Get webhook secret (starts with whsec_)
# Add to .env.local as STRIPE_WEBHOOK_SECRET
```

**Production:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret
5. Add to production environment as `STRIPE_WEBHOOK_SECRET`

### 3. Webhook Best Practices

**✅ DO:**
- Always verify signature (`stripe.webhooks.constructEvent`)
- Use raw body (not parsed JSON)
- Return 200 immediately (acknowledge receipt)
- Process idempotently (use `event.id` for deduplication)
- Log all events (for debugging)
- Handle errors gracefully (don't throw)

**❌ DON'T:**
- Parse JSON before verification (breaks signature)
- Return non-200 for business logic errors (causes retries)
- Trust event data without verification
- Perform long-running operations (use queue for that)
- Throw errors (returns 500, triggers retries)

## Subscription Status Checks

### 1. Check Subscription Status (Server)

```typescript
// lib/subscription.ts
import { prisma } from "@/lib/db";

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  if (!user?.stripeSubscriptionId || !user?.stripeCurrentPeriodEnd) {
    return false;
  }

  // Check if subscription is still active
  const now = new Date();
  return user.stripeCurrentPeriodEnd > now;
}

export async function getSubscriptionPlan(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripePriceId: true },
  });

  return user?.stripePriceId || null;
}
```

### 2. Gate Features by Subscription

```typescript
// app/dashboard/properties/page.tsx
import { hasActiveSubscription } from "@/lib/subscription";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function PropertiesPage() {
  const user = await getCurrentUser();
  
  const hasSubscription = await hasActiveSubscription(user.id);
  
  if (!hasSubscription) {
    redirect("/pricing?error=subscription_required");
  }
  
  // Proceed with page
}
```

### 3. Show Upgrade CTA (Component)

```typescript
// components/dashboard/upgrade-card.tsx
import { hasActiveSubscription } from "@/lib/subscription";
import { getCurrentUser } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function UpgradeCard() {
  const user = await getCurrentUser();
  const hasSubscription = await hasActiveSubscription(user.id);
  
  if (hasSubscription) {
    return null; // Don't show if already subscribed
  }
  
  return (
    <Card className="bg-gradient-to-r from-brand to-blue-600 text-white p-6">
      <h3 className="text-xl font-bold mb-2">Upgrade to unlock all features</h3>
      <p className="mb-4">Get unlimited properties, advanced analytics, and more.</p>
      <Button asChild variant="secondary">
        <Link href="/pricing">View Plans</Link>
      </Button>
    </Card>
  );
}
```

## Testing Stripe Integration

### 1. Test Mode

**Test Cards (Stripe):**
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`
- **Expired**: Use any past expiry date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

### 2. Stripe CLI Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.deleted
```

### 3. Mock Stripe in Tests

```typescript
// __tests__/actions/generate-user-stripe.test.ts
jest.mock("@/lib/stripe", () => ({
  stripe: {
    customers: {
      create: jest.fn().mockResolvedValue({ id: "cus_test" }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
      },
    },
  },
}));

import { generateUserStripe } from "@/actions/generate-user-stripe";

describe("generateUserStripe", () => {
  it("creates checkout session", async () => {
    const result = await generateUserStripe("price_test");
    
    expect(result.url).toContain("checkout.stripe.com");
  });
});
```

## Pricing Configuration

### 1. Product Setup (Stripe Dashboard)

**Products:**
- **PRO Plan**: $29/month or $290/year (save 17%)
- **BUSINESS Plan**: $99/month or $990/year (save 17%)

**Setup:**
1. Products → Create Product
2. Name: "PRO Plan", "BUSINESS Plan"
3. Create Prices:
   - Monthly: Recurring, Monthly interval
   - Yearly: Recurring, Yearly interval
4. Copy Price IDs → Environment variables

### 2. Display Pricing (Component)

```typescript
// components/pricing/pricing-cards.tsx
import { env } from "@/env.mjs";

export function PricingCards() {
  const plans = [
    {
      name: "PRO",
      monthlyPriceId: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
      yearlyPriceId: env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
      monthlyPrice: "$29",
      yearlyPrice: "$290",
      features: ["Unlimited properties", "Advanced analytics", "Email support"],
    },
    {
      name: "BUSINESS",
      monthlyPriceId: env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
      yearlyPriceId: env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
      monthlyPrice: "$99",
      yearlyPrice: "$990",
      features: ["Everything in PRO", "Priority support", "Custom integrations"],
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {plans.map(plan => (
        <PricingCard key={plan.name} {...plan} />
      ))}
    </div>
  );
}
```

## Security Considerations

### 1. Never Expose Secret Key

```typescript
// ❌ NEVER do this
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY); // WRONG!

// ✅ Correct - use server-side variable
const stripe = new Stripe(process.env.STRIPE_API_KEY);
```

### 2. Validate Webhook Signatures

```typescript
// ❌ NEVER trust webhook without verification
const event = JSON.parse(body); // DANGEROUS!

// ✅ Always verify
const event = stripe.webhooks.constructEvent(body, signature, secret);
```

### 3. Server-Side Subscription Checks

```typescript
// ❌ Don't trust client-side checks
// Client can manipulate localStorage, cookies, etc.

// ✅ Always check on server
const hasAccess = await hasActiveSubscription(userId);
```

## Monitoring & Alerts

### 1. Stripe Dashboard

**Monitor:**
- Failed payments (retry automatically)
- Churned customers (cancellations)
- MRR (Monthly Recurring Revenue)
- Successful checkouts

### 2. Webhook Logs

**Check webhook delivery:**
- Stripe Dashboard → Developers → Webhooks → View logs
- Look for failed deliveries (red X)
- Retry manually if needed

### 3. Application Logs

```typescript
// Log important events
console.log("✅ Subscription activated:", subscriptionId);
console.log("❌ Payment failed:", invoiceId);
console.log("🔄 Subscription updated:", subscriptionId);
```

## Common Patterns

### Display Subscription Status

```typescript
import { getCurrentUser } from "@/lib/session";
import { getSubscriptionPlan } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";

export async function SubscriptionBadge() {
  const user = await getCurrentUser();
  const plan = await getSubscriptionPlan(user.id);
  
  if (!plan) {
    return <Badge variant="outline">Free</Badge>;
  }
  
  const planName = plan.includes("pro") ? "PRO" : "BUSINESS";
  
  return <Badge variant="success">{planName}</Badge>;
}
```

## Related Files

- [`lib/stripe.ts`](../../lib/stripe.ts) - Stripe initialization
- [`lib/subscription.ts`](../../lib/subscription.ts) - Subscription helpers
- [`actions/generate-user-stripe.ts`](../../actions/generate-user-stripe.ts) - Checkout
- [`actions/open-customer-portal.ts`](../../actions/open-customer-portal.ts) - Portal
- [`app/api/webhooks/stripe/route.ts`](../../app/api/webhooks/stripe/route.ts) - Webhooks
- [`env.mjs`](../../env.mjs) - Environment config

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Test Cards](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
