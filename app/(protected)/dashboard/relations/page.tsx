import { Suspense } from "react";
import Link from "next/link";
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
import { ContactListSkeleton } from "@/components/shared/contact-card-skeleton";

export async function generateMetadata() {
  return constructMetadata({
    title: "Relations - Oikion",
    description: "Manage your client relationships and contacts",
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
  
  const filters = {
    clientType: searchParams.clientType as ClientType,
    search: searchParams.search,
    tags: searchParams.tags ? searchParams.tags.split(",").filter(Boolean) : undefined,
  };

  const contactsData = await getClients({
    ...filters,
    page: parseInt(searchParams.page || "1"),
  });
  
  if (!subscriptionPlan.isPaid && !hasRoleAccess) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          heading="Relations"
          text="Manage your client relationships and contacts"
        >
          {canCreateContent(user.role) && (
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          )}
        </DashboardHeader>

        <ContactsFilters />

        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="users" />
          <EmptyPlaceholder.Title>Upgrade to add contacts</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            Upgrade your plan to start managing client relationships
          </EmptyPlaceholder.Description>
        </EmptyPlaceholder>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Relations"
        text="Manage your client relationships and contacts"
      >
        {canCreateContent(user.role) && (
          <Link href="/dashboard/relations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </Link>
        )}
      </DashboardHeader>

      <ContactsFilters />

      {contactsData.clients.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="users" />
          <EmptyPlaceholder.Title>No contacts found</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {Object.keys(filters).some(key => filters[key as keyof typeof filters])
              ? "No contacts match your current filters"
              : "Get started by adding your first contact"
            }
          </EmptyPlaceholder.Description>
          {canCreateContent(user.role) && !Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
            <Link href="/dashboard/relations/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add First Contact
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

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  return (
    <Suspense fallback={<ContactListSkeleton count={6} />}>
      <ContactsContent searchParams={searchParams} />
    </Suspense>
  );
}