import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canAccessBilling } from "@/lib/roles";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardHeader } from "@/components/dashboard/header";
import { BillingInfo } from "@/components/pricing/billing-info";
import { Icons } from "@/components/shared/icons";

export async function generateMetadata() {
  return constructMetadata({
    title: "Billing - Oikion",
    description: "Manage your subscription and billing",
  });
}

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    redirect("/login");
  }

  // TypeScript guard - user is guaranteed to be non-null after redirect
  const currentUser = user!;

  if (!canAccessBilling(currentUser.role)) {
    redirect("/dashboard");
  }
  
  const userSubscriptionPlan = await getUserSubscriptionPlan(currentUser.id!);

  return (
    <>
      <DashboardHeader
        heading="Billing"
        text="Manage your subscription and billing"
      />
      <div className="grid gap-8">
        <Alert className="!pl-14">
          <Icons.warning />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription className="text-balance">
            This is a demo environment. Use test card numbers for payments.{" "}
            <a
              href="https://stripe.com/docs/testing#cards"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-8"
            >
              Stripe docs
            </a>
            .
          </AlertDescription>
        </Alert>
        <BillingInfo userSubscriptionPlan={userSubscriptionPlan} />
      </div>
    </>
  );
}
