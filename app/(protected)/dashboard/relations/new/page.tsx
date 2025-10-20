import { redirect } from "@/i18n/navigation";

import { getCurrentUser } from "@/lib/session";
import { canCreateContent } from "@/lib/roles";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { ClientForm } from "@/components/relations/client-form";

export const metadata = constructMetadata({
  title: "Add Relation - Oikion",
  description: "Add a new relation to your CRM.",
});

export default async function NewContactPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  if (!canCreateContent(user!.role)) {
    redirect("/dashboard/relations");
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Add Relation"
        text="Create a new relation record in your CRM."
      />

      <div className="mx-auto max-w-3xl">
        <ClientForm />
      </div>
    </div>
  );
}
