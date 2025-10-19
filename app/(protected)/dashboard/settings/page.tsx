import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import { getCurrentOrganization } from "@/actions/organizations";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { DeleteOrganizationSection } from "@/components/dashboard/delete-organization";
import { DashboardHeader } from "@/components/dashboard/header";
import { OrganizationSettingsForm } from "@/components/forms/organization-settings-form";
import { UserNameForm } from "@/components/forms/user-name-form";

export async function generateMetadata() {
  const t = await getTranslations('settings');
  
  return constructMetadata({
    title: `${t('header.title')} – Oikion`,
    description: t('header.description'),
  });
}

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  // At this point, user is guaranteed to exist with an id
  const currentUser = user as NonNullable<typeof user>;

  const organization = await getCurrentOrganization();
  const t = await getTranslations('settings');

  return (
    <>
      <DashboardHeader
        heading={t('header.title')}
        text={t('header.description')}
      />
      <div className="grid gap-6 pb-10">
        {organization && (
          <OrganizationSettingsForm
            organization={{
              id: organization.id,
              name: organization.name,
              plan: (organization as any).plan,
              isPersonal: (organization as any).isPersonal,
            }}
          />
        )}
        
        <div className="divide-y divide-muted">
          <UserNameForm user={{ id: currentUser.id!, name: currentUser.name }} />
          {/* User role management removed - roles can only be changed by org owners/admins in the Members page */}
          <DeleteOrganizationSection isPersonalOrg={organization?.isPersonal || false} />
          <DeleteAccountSection />
        </div>
      </div>
    </>
  );
}
