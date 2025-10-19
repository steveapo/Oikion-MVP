import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for a member item
 */
export function MemberItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Skeleton className="h-12 w-12 rounded-full" />
        
        <div className="space-y-2">
          {/* Name */}
          <Skeleton className="h-5 w-40" />
          {/* Email */}
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Role badge */}
        <Skeleton className="h-6 w-24 rounded-full" />
        {/* Action button */}
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Loading skeleton for members list
 */
export function MembersListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Card>
      <CardContent className="divide-y p-0">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="px-6">
            <MemberItemSkeleton />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for invite form section
 */
export function InviteFormSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  );
}
