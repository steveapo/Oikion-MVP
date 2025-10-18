"use client";

import { Link } from "@/i18n/navigation";
import { MoreHorizontal, Edit, Trash2, Eye, User, Building, Phone, Mail } from "lucide-react";
import { UserRole, ClientType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { deleteClient } from "@/actions/clients";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Client {
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

interface ContactsListProps {
  clients: Client[];
  totalPages: number;
  currentPage: number;
  userRole: UserRole;
  userId: string;
}

function ContactCard({ client, userRole, userId }: { client: Client; userRole: UserRole; userId: string }) {
  const router = useRouter();
  const canEdit = canCreateContent(userRole);
  const canDelete = canDeleteContent(userRole, client.createdBy === userId);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteClient(client.id);
      toast.success("Contact deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete contact");
    }
  };

  const getClientTypeIcon = (type: ClientType) => {
    return type === ClientType.PERSON ? User : Building;
  };

  const ClientTypeIcon = getClientTypeIcon(client.clientType);
  
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
                  {client.clientType.toLowerCase()}
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
            <span>{client._count.interactions} interactions</span>
            <span>{client._count.notes} notes</span>
            <span>{client._count.tasks} tasks</span>
          </div>
        </div>

        {/* Last Interaction */}
        {lastInteraction && (
          <div className="text-xs text-muted-foreground">
            Last contact: {formatDistanceToNow(new Date(lastInteraction.timestamp), { addSuffix: true })}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3">
        <div className="text-xs text-muted-foreground">
          By {client.creator.name || client.creator.email || "Unknown"}
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/contacts/${client.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </Link>
          
          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/contacts/${client.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {canDelete && (
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export function ContactsList({ clients, totalPages, currentPage, userRole, userId }: ContactsListProps) {
  return (
    <div className="space-y-6">
      {/* Contacts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <ContactCard key={client.id} client={client} userRole={userRole} userId={userId} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={`?page=${currentPage - 1}`} />
                </PaginationItem>
              )}
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isCurrentPage = pageNum === currentPage;
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      href={`?page=${pageNum}`}
                      isActive={isCurrentPage}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext href={`?page=${currentPage + 1}`} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}