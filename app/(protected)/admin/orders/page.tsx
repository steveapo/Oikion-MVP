import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/header";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export async function generateMetadata() {
  return constructMetadata({
    title: "Orders - Oikion",
    description: "Manage subscription orders and billing",
  });
}

export default async function OrdersPage() {
  // const user = await getCurrentUser();
  // if (!user || user.role !== "ADMIN") redirect("/login");
  
  return (
    <>
      <DashboardHeader
        heading="Orders"
        text="Manage subscription orders and billing"
      />
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="package" />
        <EmptyPlaceholder.Title>No orders yet</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          Orders will appear here when customers make purchases
        </EmptyPlaceholder.Description>
        <Button>View Documentation</Button>
      </EmptyPlaceholder>
    </>
  );
}