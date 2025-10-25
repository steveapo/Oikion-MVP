import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { ClientType } from "@prisma/client";
import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { canCreateContent } from "@/lib/roles";
import { getClients } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { ContactsFilters } from "@/components/relations/contacts-filters";
import { ContactsListWrapper } from "@/components/relations/contacts-list-wrapper";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export async function generateMetadata() {
  return constructMetadata({
    title: `${""} - Oikion`,
    description: "",
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
  if (!user?.id) {
    return null;
  }

  const subscriptionPlan = await getUserSubscriptionPlan(user.id);
  const hasRoleAccess = canCreateContent(user.role);
  
  if (!subscriptionPlan.isPaid && !hasRoleAccess) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          heading={""}
          text={""}
        >
          {canCreateContent(user.role) && (
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              {""}
        text={""}
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
        <ContactsListWrapper
          clients={contactsData.clients as any}
          totalPages={contactsData.totalPages}
          currentPage={contactsData.page}
          userRole={user.role}
          userId={user.id!}
          organizationId={(user as any).organizationId}
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