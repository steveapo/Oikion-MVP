import { redirect } from "next/navigation";

import { getCurrentOrganization } from "@/actions/organizations";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { DeleteOrganizationSection } from "@/components/dashboard/delete-organization";
import { DashboardHeader } from "@/components/dashboard/header";
import { OrganizationSettingsForm } from "@/components/forms/organization-settings-form";
import { UserNameForm } from "@/components/forms/user-name-form";

export const metadata = constructMetadata({
  title: "Settings – SaaS Starter",
  description: "Configure your account and website settings.",
});

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  const organization = await getCurrentOrganization();

  return (
    <>
      <DashboardHeader
        heading="Settings"
        text="Manage your account and organization settings."
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
          <UserNameForm user={{ id: user.id, name: user.name || "" }} />
          {/* User role management removed - roles can only be changed by org owners/admins in the Members page */}
          <DeleteOrganizationSection isPersonalOrg={organization?.isPersonal} />
          <DeleteAccountSection />
        </div>
      </div>
    </>
  );
}
