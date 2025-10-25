import { redirect } from "@/i18n/navigation";
import { auth } from "@/auth";
import { HeaderSection } from "@/components/shared/header-section";
import { InviteMemberForm } from "@/components/members/invite-member-form";
import { MembersListWrapper } from "@/components/members/members-list-wrapper";
import { PendingInvitations } from "@/components/members/pending-invitations";
import { canManageMembers } from "@/lib/roles";
import { getMembers } from "@/actions/members";
import { getInvitations } from "@/actions/invitations";
import { getCurrentOrganization } from "@/actions/organizations";
import { PersonalOrgNotice } from "@/components/members/personal-org-notice";
import { constructMetadata } from "@/lib/utils";

export async function generateMetadata() {
  const title = `${await t('header.title')} – Oikion`;
  const description = await t('header.description');
  return constructMetadata({ title, description });
}

export default async function MembersPage() {
  const session = await auth();

  if (!session?.user || !session.user.organizationId) {
    redirect("/login");
  }

  // TypeScript guard - session is guaranteed to be non-null after redirect
  const user = session!.user;
  const canManage = canManageMembers(user.role);

  const [membersResult, invitationsResult, currentOrg] = await Promise.all([
    getMembers(),
    canManage ? getInvitations() : Promise.resolve({ success: true, invitations: [] }),
    getCurrentOrganization(),
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

  // Precompute translated strings
  const headerLabel = await t('header.label');
  const headerTitle = await t('header.title');
  const teamMembersTitle = await t('sections.teamMembers');
  const inviteNewTitle = await t('sections.inviteNew');
  const pendingTitle = await "";
  const subtitleText = members.length === 1 
    ? await ""
    : await "";

  // Personal org: show notice and prevent inviting
  if (currentOrg?.isPersonal) {
    return (
      <div className="space-y-8">
        <HeaderSection
          label={headerLabel}
          title={headerTitle}
          subtitle={subtitleText}
        />

        <PersonalOrgNotice />

        <div>
          <h2 className="text-xl font-semibold mb-4">{teamMembersTitle}</h2>
          <MembersListWrapper
            initialMembers={members}
            currentUserId={user.id!}
            canManage={false}
            currentUserRole={user.role}
          organizationId={(user as any).organizationId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <HeaderSection
        label={headerLabel}
        title={headerTitle}
        subtitle={subtitleText}
      />

      {canManage && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{inviteNewTitle}</h2>
            <InviteMemberForm />
          </div>

          {pendingInvitations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{pendingTitle}</h2>
              <PendingInvitations invitations={pendingInvitations} />
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">{teamMembersTitle}</h2>
        <MembersListWrapper
          initialMembers={members}
          currentUserId={user.id!} 
          canManage={canManage}
          currentUserRole={user.role}
          organizationId={(user as any).organizationId}
        />
      </div>
    </div>
  );
}