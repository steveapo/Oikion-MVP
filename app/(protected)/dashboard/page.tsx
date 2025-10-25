import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { Suspense } from "react";
import { RecentPropertiesAsync } from "@/components/dashboard/recent-properties-async";
import { RecentClientsAsync } from "@/components/dashboard/recent-clients-async";
import { RecentPropertiesSkeleton } from "@/components/dashboard/recent-properties-skeleton";
import { RecentClientsSkeleton } from "@/components/dashboard/recent-clients-skeleton";

export async function generateMetadata() {
  return constructMetadata({
    title: "Dashboard",
    description: "Manage your properties, clients, and real estate operations",
  });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Dashboard"
        text={`Manage your properties, clients, and real estate operations${user?.role ? ` as ${user.role}` : ''}`}
      />

      {/* Two column layout for recent properties and clients - streamed independently */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<RecentPropertiesSkeleton />}>
          <RecentPropertiesAsync />
        </Suspense>
        <Suspense fallback={<RecentClientsSkeleton />}>
          <RecentClientsAsync />
        </Suspense>
      </div>
    </div>
  );
}
