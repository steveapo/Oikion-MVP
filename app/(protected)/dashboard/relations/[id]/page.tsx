import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Edit, Mail, Phone, Tag, Trash2 } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { getClient, getClients } from "@/actions/clients";
import { getClientRelationships } from "@/actions/client-relationships";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactTimeline } from "@/components/relations/contact-timeline";
import { ClientRelationships } from "@/components/relations/client-relationships";
import { DeleteRelationButton } from "@/components/relations/delete-relation-button";

export const metadata = constructMetadata({
  title: "Relation Details - Oikion",
  description: "View relation details and interaction history.",
});

interface ContactPageProps {
  params: {
    id: string;
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  let client;
  let relationships;
  let availableClients: any[] = [];

  try {
    client = await getClient(params.id);
  } catch (error) {
    console.error("Error fetching client:", error);
    notFound();
  }

  const canEdit = canCreateContent(user!.role);
  const canDelete = canDeleteContent(user!.role, client.createdBy === user!.id);

  try {
    // Get relationships
    relationships = await getClientRelationships(params.id);
    
    // Get all clients for relationship selection (max 50 per validation schema)
    const allClients = await getClients({ page: 1, limit: 50 });
    availableClients = allClients.clients
      .filter((c: any) => c.id !== params.id)
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        clientType: c.clientType,
        email: c.email,
        phone: c.phone,
      }));
  } catch (error) {
    console.error("Error fetching relationships:", error);
    // Continue without relationships - they're optional
    relationships = { relationshipsFrom: [], relationshipsTo: [] };
  }

  try {

    return (
      <div className="space-y-6">
        <DashboardHeader
          heading={client.name}
          text={`${client.clientType === "PERSON" ? "Individual" : "Company"} relation record`}
        >
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link href={`/dashboard/relations/${params.id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
            {canDelete && (
              <DeleteRelationButton clientId={params.id} clientName={client.name} />
            )}
          </div>
        </DashboardHeader>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Client Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Primary and secondary contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Primary Contact */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Primary Contact</h4>
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${client.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${client.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {client.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Secondary Contact */}
                {(client.secondaryEmail || client.secondaryPhone) && (
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="text-sm font-medium">Secondary Contact</h4>
                    {client.secondaryEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`mailto:${client.secondaryEmail}`}
                          className="text-blue-600 hover:underline"
                        >
                          {client.secondaryEmail}
                        </a>
                      </div>
                    )}
                    {client.secondaryPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${client.secondaryPhone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {client.secondaryPhone}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                {client.tags && Array.isArray(client.tags) && client.tags.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(client.tags as string[]).map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-1 border-t pt-4 text-xs text-muted-foreground">
                  <p>
                    Created by {client.creator.name || client.creator.email || "Unknown"}
                  </p>
                  <p>
                    Created on {new Date(client.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Relationships */}
            <ClientRelationships
              clientId={params.id}
              clientType={client.clientType}
              relationshipsFrom={relationships.relationshipsFrom as any}
              relationshipsTo={relationships.relationshipsTo as any}
              availableClients={availableClients}
              canManage={canEdit}
            />
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-2">
            <ContactTimeline
              interactions={client.interactions as any}
              notes={client.notes as any}
              tasks={client.tasks as any}
              clientId={params.id}
              canManage={canEdit}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering page:", error);
    notFound();
  }
}
