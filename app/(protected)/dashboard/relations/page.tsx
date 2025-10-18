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
import { ContactsList } from "@/components/relations/contacts-list";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export const metadata = constructMetadata({
  title: "Relations - Oikion",
  description: "Manage your business relationships and network.",
});

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
  
  // Check if user has role-based access to contacts
  // ORG_OWNER, ADMIN, and AGENT can access contacts regardless of subscription status
  // VIEWER can only view if subscribed
  const hasRoleAccess = canCreateContent(user.role);
  
  // If not subscribed and doesn't have role access, show limited view
  if (!subscriptionPlan.isPaid && !hasRoleAccess) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          heading="Relations"
          text="Manage your business relationships and network."
        >
          {canCreateContent(user.role) && (
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              Add Relation
            </Button>
          )}
        </DashboardHeader>

        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="users" />
          <EmptyPlaceholder.Title>Subscribe to manage relations</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            Start managing your business relationships with a subscription.
            Track interactions, notes, tasks, and more.
          </EmptyPlaceholder.Description>
          <Link href="/dashboard/billing">
            <Button>View Subscription Plans</Button>
          </Link>
        </EmptyPlaceholder>

        {/* Demo contacts for non-subscribers */}
        <div className="rounded-lg border border-dashed p-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="text-lg font-semibold text-muted-foreground">Demo Relations</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Here's what your relation list will look like:
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
                    <p>Last contact: 2 days ago</p>
                    <p>5 interactions</p>
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
                    <p>Last contact: 1 week ago</p>
                    <p>12 interactions</p>
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
        heading="Relations"
        text="Manage your business relationships and network."
      >
        {canCreateContent(user.role) && (
          <Link href="/dashboard/relations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Relation
            </Button>
          </Link>
        )}
      </DashboardHeader>

      <ContactsFilters />

      {contactsData.clients.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="users" />
          <EmptyPlaceholder.Title>No relations found</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {Object.keys(filters).some(key => filters[key as keyof typeof filters])
              ? "Try adjusting your filters to see more results."
              : "You haven't added any relations yet. Start by adding your first person or company."
            }
          </EmptyPlaceholder.Description>
          {canCreateContent(user.role) && !Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
            <Link href="/dashboard/relations/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Relation
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

export default function ContactsPage({ searchParams }: ContactsPageProps) {
  return (
    <Suspense fallback={<div>Loading relations...</div>}>
      <ContactsContent searchParams={searchParams} />
    </Suspense>
  );
}