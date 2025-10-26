import { User, Building, Phone, Mail } from "lucide-react";
import { ClientType, UserRole } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { ContactCardActions } from "./contact-card-actions";
import { formatRelativeDate } from "@/lib/format-utils";

/**
 * Client data shape for card display (minimal projection)
 */
export interface ContactCardData {
  id: string;
  clientType: ClientType;
  name: string;
  email: string | null;
  phone: string | null;
  secondaryEmail: string | null;
  secondaryPhone: string | null;
  tags: any;
  createdAt: Date;
  createdBy: string;
  creator: {
    name: string | null;
    email: string | null;
  };
  interactions: {
    id: string;
    timestamp: Date;
  }[];
  _count: {
    interactions: number;
    notes: number;
    tasks: number;
  };
}

interface ContactServerCardProps {
  client: ContactCardData;
  userRole: UserRole;
  userId: string;
}

/**
 * Server-rendered contact card component
 * Renders static HTML on the server to reduce client-side JavaScript
 * Only interactive elements (dropdown) are client components
 */
export async function ContactServerCard({ client, userRole, userId }: ContactServerCardProps) {
  const canEdit = canCreateContent(userRole);
  const canDelete = canDeleteContent(userRole, client.createdBy === userId);
  
  const ClientTypeIcon = client.clientType === ClientType.PERSON ? User : Building;
  const lastInteraction = client.interactions[0];
  const tags = Array.isArray(client.tags) ? client.tags : [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ClientTypeIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{client.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs capitalize">
                  {client.clientType === ClientType.PERSON ? "Person" : "Company"}
                </Badge>
                {tags.slice(0, 2).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{tags.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Contact Methods */}
        <div className="space-y-2">
          {client.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                {client.email}
              </a>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                {client.phone}
              </a>
            </div>
          )}
          {client.secondaryEmail && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${client.secondaryEmail}`} className="text-blue-600 hover:underline">
                {client.secondaryEmail}
              </a>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex space-x-4">
              <span>{client._count.interactions} Interactions</span>
              <span>{client._count.notes} Notes</span>
              <span>{client._count.tasks} Tasks</span>
          </div>
        </div>

        {/* Last Interaction */}
        {lastInteraction && (
          <div className="text-xs text-muted-foreground">
            Last activity: {formatRelativeDate(new Date(lastInteraction.timestamp))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3">
        <div className="text-xs text-muted-foreground">
          Created by {client.creator.name || client.creator.email || "Unknown"}
        </div>
        
        <ContactCardActions
          clientId={client.id}
          clientName={client.name}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </CardFooter>
    </Card>
  );
}
