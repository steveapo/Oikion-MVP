import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { canCreateContent } from "@/lib/roles";
import { getProperties } from "@/actions/properties";
import { Button } from "@/components/ui/button";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { PropertiesFilters } from "@/components/properties/properties-filters";
import { PropertiesList } from "@/components/properties/properties-list";
import { PropertiesListServer } from "@/components/properties/properties-list-server";
import { PropertyListSkeleton } from "@/components/properties/property-card-skeleton";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export async function generateMetadata() {
  return constructMetadata({
    title: `Properties - Oikion`,
    description: "Browse and manage properties",
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
          heading="Properties"
          text="Browse and manage properties"
        >
          {canCreateContent(user.role) && (
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          )}
        </DashboardHeader>

        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="home" />
          <EmptyPlaceholder.Title>Subscribe to unlock properties</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            Upgrade your plan to access and manage properties
          </EmptyPlaceholder.Description>
          <Link href="/dashboard/billing">
            <Button>View Plans</Button>
          </Link>
        </EmptyPlaceholder>

        {/* Demo properties for non-subscribers */}
        <div className="rounded-lg border border-dashed p-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="text-lg font-semibold text-muted-foreground">Demo properties</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore example properties to see how listings appear
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded border bg-muted/50 p-3 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Apartment in Athens</h4>
                    <p className="text-sm text-muted-foreground">Athens • 2 beds · 1 bath</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€250,000</p>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      For Sale
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded border bg-muted/50 p-3 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Office in Thessaloniki</h4>
                    <p className="text-sm text-muted-foreground">Thessaloniki • 120 m²</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€1,200/mo</p>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      For Rent
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
        heading="Properties"
        text="Browse and manage properties"
      >
        {canCreateContent(user.role) && (
          <Link href="/dashboard/properties/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
        )}
      </DashboardHeader>

      <PropertiesFilters />

      {propertiesData.properties.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="home" />
          <EmptyPlaceholder.Title>No properties found</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {Object.keys(filters).some(key => filters[key as keyof typeof filters])
              ? "No properties match your current filters"
              : "Get started by adding your first property"
            }
          </EmptyPlaceholder.Description>
          {canCreateContent(user.role) && !Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
            <Link href="/dashboard/properties/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add First Property
              </Button>
            </Link>
          )}
        </EmptyPlaceholder>
      ) : (
        <PropertiesListServer 
          properties={propertiesData.properties}
          totalPages={propertiesData.totalPages}
          currentPage={propertiesData.page}
          userRole={user.role}
          userId={user.id!}
        />
      )}
    </div>
  );
}

export default function PropertiesPage({ searchParams }: PropertiesPageProps) {
  return (
    <Suspense fallback={<PropertyListSkeleton count={6} />}>
      <PropertiesContent searchParams={searchParams} />
    </Suspense>
  );
}