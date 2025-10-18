import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/header";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export async function generateMetadata() {
  const t = await getTranslations('dashboard');
  
  return constructMetadata({
    title: t('header.title'),
    description: t('header.description'),
  });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('dashboard');

  return (
    <>
      <DashboardHeader
        heading={t('header.title')}
        text={t('header.description', { role: user?.role || 'User' })}
      />
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="post" />
        <EmptyPlaceholder.Title>{t('placeholder.title')}</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          {t('placeholder.description')}
        </EmptyPlaceholder.Description>
        <Button>{t('placeholder.button')}</Button>
      </EmptyPlaceholder>
    </>
  );
}
