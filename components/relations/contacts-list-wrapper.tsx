"use client";
import { useLiveUpdates } from "@/hooks/use-live-updates";
import { ContactsList } from "./contacts-list";
import { UserRole, ClientType } from "@prisma/client";

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

interface ContactsListWrapperProps {
  clients: Client[];
  totalPages: number;
  currentPage: number;
  userRole: UserRole;
  userId: string;
}

/**
 * Client wrapper for ContactsList that subscribes to live updates
 * Automatically refreshes when clients are created, updated, or deleted
 */
export function ContactsListWrapper({
  clients,
  totalPages,
  currentPage,
  userRole,
  userId,
  organizationId,
}: ContactsListWrapperProps & { organizationId: string | null | undefined }) {
  
  // Subscribe to client updates
  // When a client is created, updated, or deleted, router.refresh() is called automatically
  useLiveUpdates(
    ["client"],
    organizationId
  );

  return (
    <ContactsList
      clients={clients}
      totalPages={totalPages}
      currentPage={currentPage}
      userRole={userRole}
      userId={userId}
    />
  );
}
