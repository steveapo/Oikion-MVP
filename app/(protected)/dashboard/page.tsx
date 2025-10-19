import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { RecentProperties } from "@/components/dashboard/recent-properties";
import { RecentClients } from "@/components/dashboard/recent-clients";
import { getProperties } from "@/actions/properties";
import { getClients } from "@/actions/clients";

export async function generateMetadata() {
  const t = await getTranslations('dashboard');
  const user = await getCurrentUser();
  
  return constructMetadata({
    title: t('header.title'),
    description: t('header.description', { role: user?.role || 'User' }),
  });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('dashboard');

  // Fetch recent properties and clients (limit to 5 each)
  const [propertiesData, clientsData] = await Promise.all([
    getProperties({ limit: 5, page: 1 }).catch(() => ({ properties: [], totalCount: 0, page: 1, totalPages: 0 })),
    getClients({ limit: 5, page: 1 }).catch(() => ({ clients: [], totalCount: 0, page: 1, totalPages: 0 })),
  ]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading={t('header.title')}
        text={t('header.description', { role: user?.role || 'User' })}
      />

      {/* Two column layout for recent properties and clients */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentProperties properties={propertiesData.properties} />
        <RecentClients clients={clientsData.clients} />
      </div>
    </div>
  );
}
