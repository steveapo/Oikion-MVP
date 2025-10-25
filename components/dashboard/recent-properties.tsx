import { Link } from "@/i18n/navigation";
import { Home, Euro } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Property {
  id: string;
  transactionType: string;
  propertyType: string;
  price: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: number | null;
  status: string;
  address?: {
    city?: string | null;
    region?: string | null;
    locationText?: string | null;
  } | null;
  listing?: {
    marketingStatus: string;
  } | null;
  createdAt: Date;
}

interface RecentPropertiesProps {
  properties: Property[];
}

export function RecentProperties({ properties }: RecentPropertiesProps) {
  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            {""}
          </CardTitle>
          <CardDescription>{""}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">{""}</p>
            <Link href="/dashboard/properties/new">
              <Button className="mt-4" size="sm">
                {""}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              {""}
            </CardTitle>
            <CardDescription>{""}</CardDescription>
          </div>
          <Link href="/dashboard/properties">
            <Button variant="ghost" size="sm">
              {""}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {properties.map((property) => {
            const location =
              property.address?.city ||
              property.address?.region ||
              property.address?.locationText ||
              "Location not set";

            return (
              <Link
                key={property.id}
                href={`/dashboard/properties/${property.id}`}
                className="block"
              >
                <div className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1.5 overflow-hidden">
                    {/* Property Name (Type + Location) */}
                    <p className="font-medium text-sm truncate">
                      {property.propertyType} {""} {location}
                    </p>
                    
                    {/* Type | Status row */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        {property.transactionType}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <Badge
                        variant={
                          property.listing?.marketingStatus === "ACTIVE"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs px-2 py-0"
                      >
                        {property.listing?.marketingStatus || property.status}
                      </Badge>
                    </div>

                    {/* Price and details */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-primary">
                        <Euro className="h-3 w-3" />
                        {property.price.toLocaleString()}
                      </span>
                      {property.bedrooms && (
                        <span className="text-muted-foreground">
                          {property.bedrooms} {""}
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="text-muted-foreground">
                          {property.bathrooms} {""}
                        </span>
                      )}
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
