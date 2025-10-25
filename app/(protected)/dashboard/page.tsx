import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { Suspense } from "react";
import { RecentPropertiesAsync } from "@/components/dashboard/recent-properties-async";
import { RecentClientsAsync } from "@/components/dashboard/recent-clients-async";
import { RecentPropertiesSkeleton } from "@/components/dashboard/recent-properties-skeleton";
import { RecentClientsSkeleton } from "@/components/dashboard/recent-clients-skeleton";

export async function generateMetadata() {
  const t = await getTranslations('dashboard');
  return constructMetadata({
    title: t('header.title') as unknown as string,
    // Avoid extra session fetch during metadata generation
    description: t('header.description', { role: 'User' }) as unknown as string,
  });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('dashboard');

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading={t('header.title') as unknown as string}
        text={t('header.description', { role: user?.role || 'User' }) as unknown as string}
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
