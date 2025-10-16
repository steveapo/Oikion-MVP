import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { canManageMembers } from "@/lib/roles";
import { DashboardHeader } from "@/components/dashboard/header";
import { getOrganizationMembers, getInvitations } from "@/actions/invitations";
import { InviteMemberForm } from "@/components/admin/invite-member-form";
import { InvitationsList } from "@/components/admin/invitations-list";
import { MembersList } from "@/components/admin/members-list";

export const metadata = constructMetadata({
  title: "Members – Oikion",
  description: "Manage organization members and invitations.",
});

export default async function MembersPage() {
  const user = await getCurrentUser();
  
  if (!user || !canManageMembers(user.role)) {
    redirect("/dashboard");
  }

  if (!user.organizationId) {
    redirect("/dashboard");
  }

  // Fetch members and invitations in parallel
  const [members, invitations] = await Promise.all([
    getOrganizationMembers(),
    getInvitations(),
  ]);

  return (
    <>
      <DashboardHeader
        heading="Members Management"
        text="Invite new members and manage roles and permissions."
      />
      
      <div className="grid gap-6">
        {/* Invite Form */}
        <InviteMemberForm 
          currentUserRole={user.role} 
        />

        {/* Active Members */}
        <MembersList
          members={members}
          currentUserId={user.id}
          currentUserRole={user.role}
        />

        {/* Invitations */}
        {invitations && invitations.length > 0 && (
          <InvitationsList invitations={invitations} />
        )}
      </div>
    </>
  );
}
