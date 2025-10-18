"use client";

import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal, Edit, Archive, Eye } from "lucide-react";
import { UserRole, PropertyStatus, TransactionType, PropertyType } from "@prisma/client";

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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { archiveProperty } from "@/actions/properties";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Property {
  id: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  transactionType: TransactionType;
  price: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: number | null;
  description?: string | null;
  createdBy: string;
  address: {
    city: string;
    region?: string | null;
    locationText?: string | null;
  } | null;
  listing: {
    marketingStatus: string;
    listPrice: number;
  } | null;
  mediaAssets: {
    url: string;
    isPrimary: boolean;
  }[];
  creator: {
    name?: string | null;
    email?: string | null;
  };
}

interface PropertiesListProps {
  properties: Property[];
  totalPages: number;
  currentPage: number;
  userRole: UserRole;
  userId: string;
}

function PropertyCard({ property, userRole, userId }: { property: Property; userRole: UserRole; userId: string }) {
  const router = useRouter();
  const canEdit = canCreateContent(userRole);
  const canArchive = canDeleteContent(userRole, property.createdBy === userId);

  const handleArchive = async () => {
    try {
      await archiveProperty(property.id);
      toast.success("Property archived successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to archive property");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: PropertyStatus) => {
    const statusConfig = {
      [PropertyStatus.AVAILABLE]: { label: "Available", variant: "default" as const },
      [PropertyStatus.UNDER_OFFER]: { label: "Under Offer", variant: "secondary" as const },
      [PropertyStatus.SOLD]: { label: "Sold", variant: "outline" as const },
      [PropertyStatus.RENTED]: { label: "Rented", variant: "outline" as const },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTransactionTypeBadge = (type: TransactionType) => {
    const typeConfig = {
      [TransactionType.SALE]: { label: "Sale", className: "bg-blue-100 text-blue-800" },
      [TransactionType.RENT]: { label: "Rent", className: "bg-green-100 text-green-800" },
      [TransactionType.LEASE]: { label: "Lease", className: "bg-purple-100 text-purple-800" },
    };
    
    const config = typeConfig[type];
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const primaryImage = property.mediaAssets.find(asset => asset.isPrimary);
  const displayLocation = property.address 
    ? [property.address.city, property.address.region].filter(Boolean).join(", ")
    : "Location not specified";
  const isArchived = property.listing?.marketingStatus === "ARCHIVED";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0 relative">
        {isArchived && (
          <div className="absolute left-3 top-3 z-10">
            <Badge className="bg-gray-700 text-white hover:bg-gray-800 px-3 py-1 text-sm font-semibold">
              Archived
            </Badge>
          </div>
        )}
        {primaryImage ? (
          <div className="relative aspect-[16/10] w-full">
            <Image
              src={primaryImage.url}
              alt={`Property in ${displayLocation}`}
              fill
              className="object-cover"
            />
            <div className="absolute right-2 top-2">
              {getTransactionTypeBadge(property.transactionType)}
            </div>
          </div>
        ) : (
          <div className="flex aspect-[16/10] w-full items-center justify-center bg-muted">
            <div className="text-center">
              <div className="text-4xl text-muted-foreground">🏠</div>
              <p className="text-sm text-muted-foreground">No Image</p>
            </div>
            <div className="absolute right-2 top-2">
              {getTransactionTypeBadge(property.transactionType)}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()} in {displayLocation}
              </h3>
              <p className="text-sm text-muted-foreground">
                {displayLocation}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{formatPrice(property.price)}</p>
              <div className="flex flex-col gap-1.5 items-end mt-1">
                {getStatusBadge(property.status)}
                {isArchived && (
                  <Badge className="bg-gray-700 text-white hover:bg-gray-800 px-2.5 py-0.5 text-xs font-semibold">
                    Archived
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms && (
              <span>{property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}</span>
            )}
            {property.bathrooms && (
              <span>{property.bathrooms} bath{property.bathrooms !== 1 ? "s" : ""}</span>
            )}
            {property.size && (
              <span>{property.size}m²</span>
            )}
          </div>

          {/* Marketing Status */}
          {property.listing && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Status: <span className="capitalize">{property.listing.marketingStatus.toLowerCase()}</span>
              </span>
              {property.listing.listPrice !== property.price && (
                <span className="text-muted-foreground">
                  List: {formatPrice(property.listing.listPrice)}
                </span>
              )}
            </div>
          )}

          {/* Description Preview */}
          {property.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {property.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="text-xs text-muted-foreground">
          By {property.creator.name || property.creator.email || "Unknown"}
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/properties/${property.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </Link>
          
          {(canEdit || canArchive) && (
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
                      <Link href={`/dashboard/properties/${property.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {canArchive && (
                  <DropdownMenuItem onClick={handleArchive} className="text-destructive">
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
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

export function PropertiesList({ properties, totalPages, currentPage, userRole, userId }: PropertiesListProps) {
  return (
    <div className="space-y-6">
      {/* Properties Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} userRole={userRole} userId={userId} />
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