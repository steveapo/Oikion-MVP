import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { HeaderSection } from "@/components/shared/header-section";
import { InviteMemberForm } from "@/components/members/invite-member-form";
import { MembersList } from "@/components/members/members-list";
import { PendingInvitations } from "@/components/members/pending-invitations";
import { canManageMembers } from "@/lib/roles";
import { getMembers } from "@/actions/members";
import { getInvitations } from "@/actions/invitations";

export const metadata = {
  title: "Members",
  description: "Manage your organization members and invitations",
};

export default async function MembersPage() {
  const session = await auth();

  if (!session?.user || !session.user.organizationId) {
    redirect("/login");
  }

  const canManage = canManageMembers(session.user.role);

  const [membersResult, invitationsResult] = await Promise.all([
    getMembers(),
    canManage ? getInvitations() : Promise.resolve({ success: true, invitations: [] }),
  ]);

  if (!membersResult.success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">{membersResult.error}</p>
      </div>
    );
  }

  const members = membersResult.members || [];
  const invitations = invitationsResult.invitations || [];
  const pendingInvitations = invitations.filter((inv) => inv.status === "PENDING");

  return (
    <div className="space-y-8">
      <HeaderSection
        label="Organization"
        title="Members"
        subtitle={`Manage your team members and invitations • ${members.length} member${members.length !== 1 ? "s" : ""}`}
      />

      {canManage && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Invite New Member</h2>
            <InviteMemberForm />
          </div>

          {pendingInvitations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Pending Invitations ({pendingInvitations.length})
              </h2>
              <PendingInvitations invitations={pendingInvitations} />
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Team Members</h2>
        <MembersList 
          members={members} 
          currentUserId={session.user.id} 
          canManage={canManage}
          currentUserRole={session.user.role}
        />
      </div>
    </div>
  );
}
