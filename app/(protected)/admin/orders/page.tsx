import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/header";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export async function generateMetadata() {
  return constructMetadata({
    title: `${t('header.title')} – Oikion`,
    description: t('header.description'),
  });
}

export default async function OrdersPage() {
  // const user = await getCurrentUser();
  // if (!user || user.role !== "ADMIN") redirect("/login");
  
  return (
    <>
      <DashboardHeader
        heading={t('header.title')}
        text={t('header.description')}
      />
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="package" />
        <EmptyPlaceholder.Title>{t('empty.title')}</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          {t('empty.description')}
        </EmptyPlaceholder.Description>
        <Button>{t('empty.button')}</Button>
      </EmptyPlaceholder>
    </>
  );
}