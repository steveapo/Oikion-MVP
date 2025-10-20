import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { ClientType } from "@prisma/client";
import { getTranslations } from 'next-intl/server';

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { canCreateContent } from "@/lib/roles";
import { getClients } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { ContactsFilters } from "@/components/relations/contacts-filters";
import { ContactsList } from "@/components/relations/contacts-list";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export async function generateMetadata() {
  const t = await getTranslations('relations');
  
  return constructMetadata({
    title: `${t('header.title')} - Oikion`,
    description: t('header.description'),
  });
}

interface ContactsPageProps {
  searchParams: {
    clientType?: string;
    search?: string;
    tags?: string;
    page?: string;
  };
}

async function ContactsContent({ searchParams }: ContactsPageProps) {
  const user = await getCurrentUser();
  const t = await getTranslations('relations');
  
  if (!user?.id) {
    return null;
  }

  const subscriptionPlan = await getUserSubscriptionPlan(user.id);
  const hasRoleAccess = canCreateContent(user.role);
  
  if (!subscriptionPlan.isPaid && !hasRoleAccess) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          heading={t('header.title')}
          text={t('header.description')}
        >
          {canCreateContent(user.role) && (
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              {t('actions.add')}
            </Button>
          )}
        </DashboardHeader>

        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="users" />
          <EmptyPlaceholder.Title>{t('subscription.title')}</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {t('subscription.description')}
          </EmptyPlaceholder.Description>
          <Link href="/dashboard/billing">
            <Button>{t('subscription.action')}</Button>
          </Link>
        </EmptyPlaceholder>

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
                    <h4 className="font-medium">Maria Papadopoulos</h4>
                    <p className="text-sm text-muted-foreground">maria@example.com • +30 210 123 4567</p>
                    <div className="mt-1 flex gap-1">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        Buyer
                      </span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        VIP
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{t('subscription.lastContact', { time: '2 days ago' })}</p>
                    <p>{t('subscription.interactions', { count: 5 })}</p>
                  </div>
                </div>
              </div>
              <div className="rounded border bg-muted/50 p-3 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Athens Real Estate Ltd</h4>
                    <p className="text-sm text-muted-foreground">info@athensre.gr • +30 210 987 6543</p>
                    <div className="mt-1 flex gap-1">
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                        Partner
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{t('subscription.lastContact', { time: '1 week ago' })}</p>
                    <p>{t('subscription.interactions', { count: 12 })}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filters = {
    clientType: searchParams.clientType as ClientType | undefined,
    search: searchParams.search,
    tags: searchParams.tags ? searchParams.tags.split(",") : undefined,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  };

  const contactsData = await getClients(filters);

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading={t('header.title')}
        text={t('header.description')}
      >
        {canCreateContent(user.role) && (
          <Link href="/dashboard/relations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('actions.add')}
            </Button>
          </Link>
        )}
      </DashboardHeader>

      <ContactsFilters />

      {contactsData.clients.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="users" />
          <EmptyPlaceholder.Title>{t('empty.title')}</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {Object.keys(filters).some(key => filters[key as keyof typeof filters])
              ? t('empty.descriptionFiltered')
              : t('empty.description')
            }
          </EmptyPlaceholder.Description>
          {canCreateContent(user.role) && !Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
            <Link href="/dashboard/relations/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('actions.addFirst')}
              </Button>
            </Link>
          )}
        </EmptyPlaceholder>
      ) : (
        <ContactsList 
          clients={contactsData.clients}
          totalPages={contactsData.totalPages}
          currentPage={contactsData.page}
          userRole={user.role}
          userId={user.id!}
        />
      )}
    </div>
  );
}

import { ContactListSkeleton } from "@/components/shared/contact-card-skeleton";

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  return (
    <Suspense fallback={<ContactListSkeleton count={6} />}>
      <ContactsContent searchParams={searchParams} />
    </Suspense>
  );
}