import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { HeaderSection } from "@/components/shared/header-section";
import { InviteMemberForm } from "@/components/members/invite-member-form";
import { MembersList } from "@/components/members/members-list";
import { PendingInvitations } from "@/components/members/pending-invitations";
import { canManageMembers } from "@/lib/roles";
import { getMembers } from "@/actions/members";
import { getInvitations } from "@/actions/invitations";
import { constructMetadata } from "@/lib/utils";

export async function generateMetadata() {
  const t = await getTranslations('members');
  
  return constructMetadata({
    title: `${t('header.title')} – Oikion`,
    description: t('header.description'),
  });
}

export default async function MembersPage() {
  const session = await auth();

  if (!session?.user || !session.user.organizationId) {
    redirect("/login");
  }

  // TypeScript guard - session is guaranteed to be non-null after redirect
  const user = session!.user;
  const t = await getTranslations('members');
  const canManage = canManageMembers(user.role);

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
        label={t('header.label')}
        title={t('header.title')}
        subtitle={members.length === 1 
          ? t('header.subtitle', { count: members.length })
          : t('header.subtitlePlural', { count: members.length })
        }
      />

      {canManage && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('sections.inviteNew')}</h2>
            <InviteMemberForm />
          </div>

          {pendingInvitations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {t('sections.pendingCount', { count: pendingInvitations.length })}
              </h2>
              <PendingInvitations invitations={pendingInvitations} />
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">{t('sections.teamMembers')}</h2>
        <MembersList 
          members={members} 
          currentUserId={user.id!} 
          canManage={canManage}
          currentUserRole={user.role}
        />
      </div>
    </div>
  );
}