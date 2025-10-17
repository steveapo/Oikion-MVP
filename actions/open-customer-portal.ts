"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import {
  ActionResponse,
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
} from "@/lib/action-response";

export type responseAction = {
  status: "success" | "error";
  stripeUrl?: string;
};

const billingUrl = absoluteUrl("/dashboard/billing");

export async function openCustomerPortal(
  userStripeId: string,
): Promise<responseAction> {
  let redirectUrl: string = "";

  // Authentication
  const session = await auth();

  if (!session?.user || !session?.user.email) {
    throw new Error("Unauthorized");
  }

  try {

    if (userStripeId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userStripeId,
        return_url: billingUrl,
      });

      redirectUrl = stripeSession.url as string;
    }
  } catch (error) {
    throw new Error("Failed to generate user stripe session");
  }

  redirect(redirectUrl);
}
