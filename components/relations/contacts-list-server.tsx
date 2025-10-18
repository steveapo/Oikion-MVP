import { UserRole } from "@prisma/client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ContactServerCard, ContactCardData } from "./contact-server-card";

interface ContactsListServerProps {
  clients: ContactCardData[];
  totalPages: number;
  currentPage: number;
  userRole: UserRole;
  userId: string;
}

/**
 * Server-rendered contacts list wrapper
 * Uses ContactServerCard for each client to minimize client-side JavaScript
 */
export function ContactsListServer({ 
  clients, 
  totalPages, 
  currentPage, 
  userRole, 
  userId 
}: ContactsListServerProps) {
  return (
    <div className="space-y-6">
      {/* Contacts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <ContactServerCard 
            key={client.id} 
            client={client} 
            userRole={userRole} 
            userId={userId} 
          />
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
