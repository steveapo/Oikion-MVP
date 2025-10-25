import { redirect } from "@/i18n/navigation";

import { getCurrentOrganization } from "@/actions/organizations";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DeleteOrganizationSection } from "@/components/dashboard/delete-organization";
import { DashboardHeader } from "@/components/dashboard/header";
import dynamic from "next/dynamic";
const OrganizationSettingsForm = dynamic(() => import("@/components/forms/organization-settings-form").then(m => m.OrganizationSettingsForm), {
  loading: () => <div className="h-40 rounded-lg border p-4"><div className="h-4 w-44 bg-muted animate-pulse rounded mb-3" /><div className="h-24 bg-muted animate-pulse rounded" /></div>,
  ssr: false,
});

export async function generateMetadata() {
  return constructMetadata({
    title: "Agency Settings – Oikion",
    description: "Manage your organization settings, billing and ownership.",
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

  return (
    <>
      <DashboardHeader
        heading="Agency Settings"
        text="Manage your organization settings, billing and ownership."
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

        {/* Organization destructive actions */}
        <DeleteOrganizationSection isPersonalOrg={organization?.isPersonal || false} />
      </div>
    </>
  );
}
