import { DashboardHeader } from "@/components/dashboard/header";
import { ContactListSkeleton } from "@/components/shared/contact-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function RelationsLoading() {
  return (
    <div className="space-y-6">
      {/* Header with action button skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Contact cards grid */}
      <ContactListSkeleton count={6} />
    </div>
  );
}
