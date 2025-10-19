import { DashboardHeader } from "@/components/dashboard/header";
import { ActivityFeedSkeleton } from "@/components/shared/activity-feed-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function OikosyncLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filters skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Activity feed */}
      <ActivityFeedSkeleton count={8} />
    </div>
  );
}
