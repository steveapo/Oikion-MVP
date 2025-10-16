import { Suspense } from "react";
import Link from "next/link";
import { Plus, Home } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { canCreateContent } from "@/lib/roles";
import { getProperties } from "@/actions/properties";
import { Button } from "@/components/ui/button";
import { constructMetadata } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { PropertiesFilters } from "@/components/properties/properties-filters";
import { PropertiesList } from "@/components/properties/properties-list";
import PropertiesLoading from "./loading";

export const metadata = constructMetadata({
  title: "Properties - Oikion",
  description: "Manage your property listings and MLS data.",
});

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
      <Container maxWidth="2xl">
        <Section spacing="comfortable">
          <PageHeader
            title="Properties"
            description="Manage your property listings and MLS data."
            actions={
              canCreateContent(user.role) ? (
                <Button disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              ) : undefined
            }
          />

          <EmptyState
            icon={Home}
            title="Subscribe to manage properties"
            description="Start managing your property inventory with a subscription. Access full MLS functionality, property tracking, and more."
            action={{
              label: "View Subscription Plans",
              onClick: () => window.location.href = "/dashboard/billing"
            }}
          />

        {/* Demo properties for non-subscribers */}
        <div className="rounded-lg border border-dashed p-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="text-lg font-semibold text-muted-foreground">Demo Properties</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Here's what your property list will look like:
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded border bg-muted/50 p-3 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Modern Apartment in Kolonaki</h4>
                    <p className="text-sm text-muted-foreground">Athens, Attica • 2 bed, 1 bath • 85m²</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€320,000</p>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Available
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded border bg-muted/50 p-3 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Villa with Sea View</h4>
                    <p className="text-sm text-muted-foreground">Mykonos • 4 bed, 3 bath • 220m²</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€1,250,000</p>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      Under Offer  
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Container>
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
    <Container maxWidth="2xl">
      <Section spacing="comfortable">
        <PageHeader
          title="Properties"
          description="Manage your property listings and MLS data."
          actions={
            canCreateContent(user.role) ? (
              <Link href="/dashboard/properties/new">
                <Button variant="brand">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </Link>
            ) : undefined
          }
        />

        <PropertiesFilters />

        {propertiesData.properties.length === 0 ? (
          <EmptyState
            icon={Home}
            title="No properties found"
            description={
              Object.keys(filters).some(key => filters[key as keyof typeof filters])
                ? "Try adjusting your filters to see more results."
                : "You haven't created any properties yet. Start by adding your first property."
            }
            action={
              canCreateContent(user.role) && !Object.keys(filters).some(key => filters[key as keyof typeof filters])
                ? {
                    label: "Add Your First Property",
                    onClick: () => window.location.href = "/dashboard/properties/new"
                  }
                : undefined
            }
          />
        ) : (
          <PropertiesList 
            properties={propertiesData.properties}
            totalPages={propertiesData.totalPages}
            currentPage={propertiesData.page}
            userRole={user.role}
            userId={user.id!}
          />
        )}
      </Section>
    </Container>
  );
}

export default function PropertiesPage({ searchParams }: PropertiesPageProps) {
  return (
    <Suspense fallback={<PropertiesLoading />}>
      <PropertiesContent searchParams={searchParams} />
    </Suspense>
  );
}