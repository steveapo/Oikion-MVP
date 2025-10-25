import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { getTranslations } from 'next-intl/server';

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { canCreateContent } from "@/lib/roles";
import { getProperties } from "@/actions/properties";
import { Button } from "@/components/ui/button";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { PropertiesFilters } from "@/components/properties/properties-filters";
import { PropertiesListServer } from "@/components/properties/properties-list-server";
import { PropertyListSkeleton } from "@/components/properties/property-card-skeleton";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { PropertiesPageClient } from "@/components/properties/properties-page-client";

export async function generateMetadata() {
  const t = await getTranslations('properties');
  
  return constructMetadata({
    title: `${t('header.title') as unknown as string} - Oikion`,
    description: t('header.description') as unknown as string,
  });
}

interface PropertiesPageProps {
  searchParams: {
    status?: string;
    transactionType?: string;
    propertyType?: string;
    minPrice?: string;
    maxPrice?: string;
    location?: string;
    bedrooms?: string;
    page?: string;
  };
}

async function PropertiesContent({ searchParams }: PropertiesPageProps) {
  const user = await getCurrentUser();
  const t = await getTranslations('properties');
  
  if (!user) {
    return null;
  }

  if (!user.id) {
    return null;
  }

  const subscriptionPlan = await getUserSubscriptionPlan(user.id!);
  
  // Check if user has role-based access to properties
  // ORG_OWNER, ADMIN, and AGENT can access properties regardless of subscription status
  // VIEWER can only view if subscribed
  const hasRoleAccess = canCreateContent(user.role);
  
  // If not subscribed and doesn't have role access, show limited view
  if (!subscriptionPlan.isPaid && !hasRoleAccess) {
    return (
      <div className="space-y-6">
        <DashboardHeader
        heading={t('header.title') as unknown as string}
        text={t('header.description') as unknown as string}
        >
          {canCreateContent(user.role) && (
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              {t('actions.add')}
            </Button>
          )}
        </DashboardHeader>

        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="home" />
          <EmptyPlaceholder.Title>{t('subscription.title')}</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {t('subscription.description')}
          </EmptyPlaceholder.Description>
          <Link href="/dashboard/billing">
            <Button>{t('subscription.action')}</Button>
          </Link>
        </EmptyPlaceholder>

        {/* Demo properties for non-subscribers */}
        <div className="rounded-lg border border-dashed p-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="text-lg font-semibold text-muted-foreground">{t('subscription.demoTitle')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('subscription.demoDescription')}
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded border bg-muted/50 p-3 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{t('subscription.demoProperty1.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('subscription.demoProperty1.location')} • {t('subscription.demoProperty1.details')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{t('subscription.demoProperty1.price')}</p>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      {t('subscription.demoProperty1.status')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded border bg-muted/50 p-3 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{t('subscription.demoProperty2.title')}</h4>
                    <p className="text-sm text-muted-foreground">{t('subscription.demoProperty2.location')} • {t('subscription.demoProperty2.details')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{t('subscription.demoProperty2.price')}</p>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {t('subscription.demoProperty2.status')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parse search params for filters
  const filters = {
    status: searchParams.status ? (searchParams.status as any) : undefined,
    transactionType: searchParams.transactionType ? (searchParams.transactionType as any) : undefined,
    propertyType: searchParams.propertyType ? (searchParams.propertyType as any) : undefined,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    location: searchParams.location,
    bedrooms: searchParams.bedrooms ? parseInt(searchParams.bedrooms) : undefined,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  };

  const propertiesData = await getProperties(filters);

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading={t('header.title') as unknown as string}
        text={t('header.description') as unknown as string}
      >
        {canCreateContent(user.role) && (
          <Link href="/dashboard/properties/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('actions.add')}
            </Button>
          </Link>
        )}
      </DashboardHeader>

      <PropertiesFilters />

      {propertiesData.properties.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="home" />
          <EmptyPlaceholder.Title>{t('empty.title')}</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {Object.keys(filters).some(key => filters[key as keyof typeof filters])
              ? t('empty.descriptionFiltered')
              : t('empty.description')
            }
          </EmptyPlaceholder.Description>
          {canCreateContent(user.role) && !Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
            <Link href="/dashboard/properties/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('actions.addFirst')}
              </Button>
            </Link>
          )}
        </EmptyPlaceholder>
      ) : (
        <PropertiesListServer
          properties={propertiesData.properties as any}
          totalPages={propertiesData.totalPages}
          currentPage={propertiesData.page}
          userRole={user.role}
          userId={user.id!}
        />
      )}
    </div>
  );
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const user = await getCurrentUser();
  return (
    <>
      <PropertiesPageClient organizationId={(user as any)?.organizationId} />
      <Suspense fallback={<PropertyListSkeleton count={6} />}>
        <PropertiesContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}