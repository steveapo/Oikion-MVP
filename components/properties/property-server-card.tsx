import Image from "next/image";
import { PropertyStatus, PropertyType, TransactionType, UserRole } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { PropertyCardActions } from "./property-card-actions";
import {
  formatCurrency,
  formatPropertyType,
  getStatusBadgeVariant,
  getStatusLabel,
  getTransactionTypeBadge,
  formatLocation,
  formatBedrooms,
  formatBathrooms,
  formatSize,
} from "@/lib/format-utils";

/**
 * Property data shape for card display (minimal projection)
 */
export interface PropertyCardData {
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

interface PropertyServerCardProps {
  property: PropertyCardData;
  userRole: UserRole;
  userId: string;
}

/**
 * Server-rendered property card component
 * Renders static HTML on the server to reduce client-side JavaScript
 * Only interactive elements (dropdown) are client components
 */
export function PropertyServerCard({ property, userRole, userId }: PropertyServerCardProps) {
  const canEdit = canCreateContent(userRole);
  const canArchive = canDeleteContent(userRole, property.createdBy === userId);
  
  const primaryImage = property.mediaAssets.find(asset => asset.isPrimary);
  const displayLocation = formatLocation(property.address?.city, property.address?.region);
  const isArchived = property.listing?.marketingStatus === "ARCHIVED";
  const transactionBadge = getTransactionTypeBadge(property.transactionType);

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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute right-2 top-2">
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${transactionBadge.className}`}>
                {transactionBadge.label}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex aspect-[16/10] w-full items-center justify-center bg-muted">
            <div className="text-center">
              <div className="text-4xl text-muted-foreground">🏠</div>
              <p className="text-sm text-muted-foreground">No Image</p>
            </div>
            <div className="absolute right-2 top-2">
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${transactionBadge.className}`}>
                {transactionBadge.label}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {formatPropertyType(property.propertyType)} in {displayLocation}
              </h3>
              <p className="text-sm text-muted-foreground">
                {displayLocation}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{formatCurrency(property.price)}</p>
              <div className="flex flex-col gap-1.5 items-end mt-1">
                <Badge variant={getStatusBadgeVariant(property.status)}>
                  {getStatusLabel(property.status)}
                </Badge>
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
              <span>{formatBedrooms(property.bedrooms)}</span>
            )}
            {property.bathrooms && (
              <span>{formatBathrooms(property.bathrooms)}</span>
            )}
            {property.size && (
              <span>{formatSize(property.size)}</span>
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
                  List: {formatCurrency(property.listing.listPrice)}
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
        
        <PropertyCardActions
          propertyId={property.id}
          canEdit={canEdit}
          canArchive={canArchive}
          isArchived={isArchived}
        />
      </CardFooter>
    </Card>
  );
}
