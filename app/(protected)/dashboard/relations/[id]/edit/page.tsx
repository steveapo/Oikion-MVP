import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getClient } from "@/actions/clients";
import { canCreateContent } from "@/lib/roles";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { ClientForm } from "@/components/relations/client-form";
import { ClientType } from "@prisma/client";

export const metadata = constructMetadata({
  title: "Edit Relation - Oikion",
  description: "Update relation information in your CRM.",
});

interface EditContactPageProps {
  params: {
    id: string;
  };
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  if (!canCreateContent(user.role)) {
    redirect("/dashboard/relations");
  }

  try {
    const client = await getClient(params.id);

    // Convert client data to form format
    const defaultValues = {
      clientType: client.clientType as ClientType,
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      secondaryEmail: client.secondaryEmail || "",
      secondaryPhone: client.secondaryPhone || "",
      tags: Array.isArray(client.tags) ? (client.tags as string[]) : [],
    };

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <DashboardHeader
          heading="Edit Relation"
          text={`Update information for ${client.name}`}
        />

        <ClientForm 
          defaultValues={defaultValues}
          isEditing={true}
          clientId={params.id}
        />
      </div>
    );
  } catch (error) {
    redirect("/dashboard/relations");
  }
}
