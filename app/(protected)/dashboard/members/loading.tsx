import { Skeleton } from "@/components/ui/skeleton";
import { MembersListSkeleton, InviteFormSkeleton } from "@/components/shared/members-list-skeleton";

export default function MembersLoading() {
  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Invite form section */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <InviteFormSkeleton />
      </div>

      {/* Pending invitations section */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-56" />
        <MembersListSkeleton count={2} />
      </div>

      {/* Team members section */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <MembersListSkeleton count={5} />
      </div>
    </div>
  );
}
