import { Suspense } from "react";
import { Activity, Rss } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { getActivities } from "@/actions/activities";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { ActivityFilters } from "@/components/oikosync/activity-filters";
import { ActivityFeed } from "@/components/oikosync/activity-feed";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = constructMetadata({
  title: "Oikosync - Oikion",
  description: "Stay updated with your organization's activity feed.",
});

interface OikosyncPageProps {
  searchParams: {
    actorId?: string;
    entityType?: string;
    actionType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  };
}

async function OikosyncContent({ searchParams }: OikosyncPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const subscriptionPlan = await getUserSubscriptionPlan(user.id);
  
  // Check if user has role-based access to activity feed
  // All organization members can view the activity feed
  const hasRoleAccess = true; // Activity feed is available to all roles in an organization
  
  // If not subscribed and doesn't have role access, show limited view
  if (!subscriptionPlan.isPaid && !hasRoleAccess) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          heading="Oikosync"
          text="Stay updated with your organization's activity feed."
        />

        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="activity" />
          <EmptyPlaceholder.Title>Subscribe to view activity feed</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            See your team's activity in real-time with a subscription.
            Track property updates, client interactions, and more.
          </EmptyPlaceholder.Description>
          <Link href="/dashboard/billing">
            <Button>View Subscription Plans</Button>
          </Link>
        </EmptyPlaceholder>

        {/* Demo activities for non-subscribers */}
        <div className="rounded-lg border border-dashed p-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="text-lg font-semibold text-muted-foreground">Demo Activity Feed</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Here's what your activity feed will look like:
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded border bg-muted/50 p-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">John created property Apartment in Athens</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="rounded border bg-muted/50 p-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Rss className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Maria logged a viewing with Client Smith</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="rounded border bg-muted/50 p-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                    <Activity className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Alex completed task "Follow up with buyer"</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
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
    actorId: searchParams.actorId,
    entityType: searchParams.entityType as any,
    actionType: searchParams.actionType as any,
    dateFrom: searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined,
    dateTo: searchParams.dateTo ? new Date(searchParams.dateTo) : undefined,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  };

  const activitiesData = await getActivities(filters);

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Oikosync"
        text="Stay updated with your organization's activity feed."
      />

      <ActivityFilters />

      {activitiesData.activities.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="activity" />
          <EmptyPlaceholder.Title>No activities found</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {Object.keys(filters).some(key => filters[key as keyof typeof filters])
              ? "Try adjusting your filters to see more activities."
              : "No activities in the selected time period. Activities will appear here as your team works with properties and clients."
            }
          </EmptyPlaceholder.Description>
        </EmptyPlaceholder>
      ) : (
        <ActivityFeed 
          activities={activitiesData.activities}
          totalPages={activitiesData.totalPages}
          currentPage={activitiesData.page}
        />
      )}
    </div>
  );
}

export default function OikosyncPage({ searchParams }: OikosyncPageProps) {
  return (
    <Suspense fallback={<div>Loading activities...</div>}>
      <OikosyncContent searchParams={searchParams} />
    </Suspense>
  );
}