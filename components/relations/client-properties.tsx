"use client";

import Link from "next/link";
import { Home, MapPin, Euro } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

// Define PropertyRelationType since Prisma client may not be regenerated yet
type PropertyRelationType = 
  | "OWNER"
  | "CO_OWNER"
  | "INVESTOR"
  | "HEIR"
  | "TENANT"
  | "BUYER"
  | "SELLER"
  | "INTERESTED"
  | "OTHER";

interface Property {
  id: string;
  price: number;
  propertyType: string;
  address: {
    city: string | null;
    region: string | null;
  } | null;
  listing: {
    listPrice: number;
  } | null;
  mediaAssets: {
    url: string;
    isPrimary: boolean;
  }[];
}

interface PropertyRelationship {
  id: string;
  relationshipType: PropertyRelationType;
  notes?: string | null;
  property: Property;
}

interface ClientPropertiesProps {
  relationships: PropertyRelationship[];
}

const relationshipTypeLabels: Record<PropertyRelationType, string> = {
  OWNER: "Owner",
  CO_OWNER: "Co-Owner",
  INVESTOR: "Investor",
  HEIR: "Heir",
  TENANT: "Tenant",
  BUYER: "Buyer",
  SELLER: "Seller",
  INTERESTED: "Interested",
  OTHER: "Other",
};

const relationshipTypeColors: Record<PropertyRelationType, string> = {
  OWNER: "bg-purple-100 text-purple-800 border-purple-200",
  CO_OWNER: "bg-blue-100 text-blue-800 border-blue-200",
  INVESTOR: "bg-green-100 text-green-800 border-green-200",
  HEIR: "bg-orange-100 text-orange-800 border-orange-200",
  TENANT: "bg-cyan-100 text-cyan-800 border-cyan-200",
  BUYER: "bg-emerald-100 text-emerald-800 border-emerald-200",
  SELLER: "bg-amber-100 text-amber-800 border-amber-200",
  INTERESTED: "bg-gray-100 text-gray-800 border-gray-200",
  OTHER: "bg-slate-100 text-slate-800 border-slate-200",
};

export function ClientProperties({ relationships }: ClientPropertiesProps) {
  if (relationships.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Linked Properties
          </CardTitle>
          <CardDescription>
            Properties associated with this relation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Home className="mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">No linked properties</h3>
            <p className="text-sm text-muted-foreground">
              This relation is not linked to any properties yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Linked Properties ({relationships.length})
        </CardTitle>
        <CardDescription>
          Properties associated with this relation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relationships.map((relationship) => {
            const property = relationship.property;
            const location = property.address 
              ? [property.address.city, property.address.region].filter(Boolean).join(", ")
              : "Location not specified";
            const primaryImage = property.mediaAssets.find(img => img.isPrimary) || property.mediaAssets[0];

            return (
              <Link 
                key={relationship.id}
                href={`/dashboard/properties/${property.id}`}
                className="block"
              >
                <div className="flex gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50 hover:shadow-md">
                  {/* Property Image */}
                  <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={property.propertyType}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Home className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Property Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold hover:underline">
                          {property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()}
                        </h4>
                        <Badge
                          variant="outline"
                          className={relationshipTypeColors[relationship.relationshipType]}
                        >
                          {relationshipTypeLabels[relationship.relationshipType]}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{location}</span>
                      </div>
                      {relationship.notes && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {relationship.notes}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1 font-semibold text-primary">
                      <Euro className="h-4 w-4" />
                      <span>{formatPrice(property.price)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
