"use client";
import { useLiveUpdates } from "@/hooks/use-live-updates";
import { MembersList } from "./members-list";
import { UserRole } from "@prisma/client";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  image: string | null;
  createdAt: Date;
}

interface MembersListWrapperProps {
  initialMembers: Member[];
  currentUserId: string;
  canManage: boolean;
  currentUserRole: UserRole;
}

/**
 * Client wrapper for MembersList that subscribes to live updates
 * This component will automatically refresh when members or invitations change
 */
export function MembersListWrapper({
  initialMembers,
  currentUserId,
  canManage,
  currentUserRole,
  organizationId,
}: MembersListWrapperProps & { organizationId: string | null | undefined }) {
  
  // Subscribe to member and invitation updates
  // When an update occurs, router.refresh() is called automatically
  // which causes the parent page to re-fetch data from the server
  useLiveUpdates(
    ["member", "invitation"],
    organizationId
  );

  return (
    <MembersList
      members={initialMembers}
      currentUserId={currentUserId}
      canManage={canManage}
      currentUserRole={currentUserRole}
    />
  );
}
