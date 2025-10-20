import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for a single activity item
 */
export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-4 pb-4">
      {/* Avatar/Icon */}
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />

      <div className="flex-1 space-y-2">
        {/* Activity text */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        
        {/* Timestamp and entity info */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Action icon */}
      <Skeleton className="h-5 w-5 shrink-0" />
    </div>
  );
}

/**
 * Loading skeleton for activity feed
 */
export function ActivityFeedSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>
            <ActivityItemSkeleton />
            {i < count - 1 && <div className="h-px bg-border mt-4" />}
          </div>
        ))}
      </div>
    </Card>
  );
}
