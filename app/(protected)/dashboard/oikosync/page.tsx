import { Suspense } from "react";
import { Activity, Rss } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { getActivities } from "@/actions/activities";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { ActivityFilters } from "@/components/oikosync/activity-filters";
import { ActivityFeedWrapper } from "@/components/oikosync/activity-feed-wrapper";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

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
  const t = await getTranslations("oikosync");
  
  if (!user) {
    return null;
  }

  if (!user.id) {
    return null;
  }

  const subscriptionPlan = await getUserSubscriptionPlan(user.id!);
  
  // Check if user has role-based access to activity feed
  // All organization members can view the activity feed
  const hasRoleAccess = true; // Activity feed is available to all roles in an organization
  
  // If not subscribed and doesn't have role access, show limited view
  if (!subscriptionPlan.isPaid && !hasRoleAccess) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          heading={t("header.title") as unknown as string}
          text={t("header.description") as unknown as string}
        />

        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="activity" />
          <EmptyPlaceholder.Title>{t("subscription.title") as unknown as string}</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {t("subscription.description") as unknown as string}
          </EmptyPlaceholder.Description>
          <Link href="/dashboard/billing" className={buttonVariants({ variant: "default" })}>
            {t("subscription.viewPlans") as unknown as string}
          </Link>
        </EmptyPlaceholder>

        {/* Demo activities for non-subscribers */}
        <div className="rounded-lg border border-dashed p-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="text-lg font-semibold text-muted-foreground">{t("subscription.demoTitle") as unknown as string}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("subscription.demoDescription") as unknown as string}
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
                    <p className="text-sm font-medium">Alex completed task &quot;Follow up with buyer&quot;</p>
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
    dateTo: searchParams.dateTo ? new Date(searchParams.dateTo) : new Date(),
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  };

  const activitiesData = await getActivities(filters);

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading={t("header.title") as unknown as string}
        text={t("header.description") as unknown as string}
      />

      <ActivityFilters />

      {activitiesData.activities.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="activity" />
          <EmptyPlaceholder.Title>{t("empty.noResults")}</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {Object.keys(filters).some(key => filters[key as keyof typeof filters])
              ? t("empty.tryAdjustFilters")
              : t("empty.noActivitiesInPeriod")
            }
          </EmptyPlaceholder.Description>
        </EmptyPlaceholder>
      ) : (
        <ActivityFeedWrapper
          activities={activitiesData.activities}
          totalPages={activitiesData.totalPages}
          currentPage={activitiesData.page}
          organizationId={(user as any).organizationId}
        />
      )}
    </div>
  );
}

import { ActivityFeedSkeleton } from "@/components/shared/activity-feed-skeleton";

export default async function OikosyncPage({ searchParams }: OikosyncPageProps) {
  return (
    <Suspense fallback={<ActivityFeedSkeleton count={8} />}>
      <OikosyncContent searchParams={searchParams} />
    </Suspense>
  );
}