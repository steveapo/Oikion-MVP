import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import InfoCard from "@/components/dashboard/info-card";
import TransactionsList from "@/components/dashboard/transactions-list";

export async function generateMetadata() {
  const t = await getTranslations('admin');
  
  return constructMetadata({
    title: `${t('header.title')} – Oikion`,
    description: t('header.description'),
  });
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");
  
  const t = await getTranslations('admin');

  return (
    <>
      <DashboardHeader
        heading={t('header.title')}
        text={t('header.description')}
      />
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard />
          <InfoCard />
          <InfoCard />
          <InfoCard />
        </div>
        <TransactionsList />
        <TransactionsList />
      </div>
    </>
  );
}
