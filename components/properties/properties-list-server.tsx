import { UserRole } from "@prisma/client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PropertyServerCard, PropertyCardData } from "./property-server-card";

interface PropertiesListServerProps {
  properties: PropertyCardData[];
  totalPages: number;
  currentPage: number;
  userRole: UserRole;
  userId: string;
}

/**
 * Server-rendered properties list wrapper
 * Uses PropertyServerCard for each property to minimize client-side JavaScript
 */
export function PropertiesListServer({ 
  properties, 
  totalPages, 
  currentPage, 
  userRole, 
  userId 
}: PropertiesListServerProps) {
  return (
    <div className="space-y-6">
      {/* Properties Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyServerCard 
            key={property.id} 
            property={property} 
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
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
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
