import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Archive, Camera, MapPin, Calendar, User } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { getProperty } from "@/actions/properties";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PropertyImageGallery } from "@/components/properties/property-image-gallery";
import { PropertyTimeline } from "@/components/properties/property-timeline";
import { constructMetadata } from "@/lib/utils";
import { PropertyStatus, TransactionType, PropertyType } from "@prisma/client";

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PropertyDetailPageProps) {
  try {
    const property = await getProperty(params.id);
    const location = property.address 
      ? [property.address.city, property.address.region].filter(Boolean).join(", ")
      : "Property";
    
    return constructMetadata({
      title: `${property.propertyType} in ${location} - Oikion`,
      description: property.description || `${property.propertyType} for ${property.transactionType.toLowerCase()} in ${location}`,
    });
  } catch {
    return constructMetadata({
      title: "Property Not Found - Oikion",
      description: "The requested property could not be found.",
    });
  }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    notFound();
  }

  let property;
  try {
    property = await getProperty(params.id);
  } catch {
    notFound();
  }

  const canEdit = canCreateContent(user.role);
  const canArchive = canDeleteContent(user.role, property.createdBy === user.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: PropertyStatus) => {
    const statusConfig = {
      [PropertyStatus.AVAILABLE]: { label: "Available", className: "bg-green-100 text-green-800" },
      [PropertyStatus.UNDER_OFFER]: { label: "Under Offer", className: "bg-yellow-100 text-yellow-800" },
      [PropertyStatus.SOLD]: { label: "Sold", className: "bg-gray-100 text-gray-800" },
      [PropertyStatus.RENTED]: { label: "Rented", className: "bg-blue-100 text-blue-800" },
    };
    
    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getTransactionTypeBadge = (type: TransactionType) => {
    const typeConfig = {
      [TransactionType.SALE]: { label: "For Sale", className: "bg-blue-100 text-blue-800" },
      [TransactionType.RENT]: { label: "For Rent", className: "bg-green-100 text-green-800" },
      [TransactionType.LEASE]: { label: "For Lease", className: "bg-purple-100 text-purple-800" },
    };
    
    const config = typeConfig[type];
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const displayLocation = property.address 
    ? [property.address.city, property.address.region].filter(Boolean).join(", ")
    : "Location not specified";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/properties">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          {canEdit && (
            <Link href={`/dashboard/properties/${property.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Property
              </Button>
            </Link>
          )}
          {canArchive && (
            <Button variant="outline">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Property Images */}
          <Card>
            <CardContent className="p-0">
              {property.mediaAssets.length > 0 ? (
                <PropertyImageGallery images={property.mediaAssets} />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center bg-muted">
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No images available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()} in {displayLocation}
                  </CardTitle>
                  <div className="mt-2 flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{displayLocation}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{formatPrice(property.price)}</div>
                  <div className="mt-2 space-x-2">
                    {getStatusBadge(property.status)}
                    {getTransactionTypeBadge(property.transactionType)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Specifications */}
              <div>
                <h3 className="font-semibold mb-3">Property Details</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {property.bedrooms && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{property.bedrooms}</div>
                      <div className="text-sm text-muted-foreground">Bedroom{property.bedrooms !== 1 ? 's' : ''}</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{property.bathrooms}</div>
                      <div className="text-sm text-muted-foreground">Bathroom{property.bathrooms !== 1 ? 's' : ''}</div>
                    </div>
                  )}
                  {property.size && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{property.size}</div>
                      <div className="text-sm text-muted-foreground">m²</div>
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{property.yearBuilt}</div>
                      <div className="text-sm text-muted-foreground">Built</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              {property.features && Array.isArray(property.features) && property.features.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {property.description && (
                <div>
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Address Details */}
              {property.address && (
                <div>
                  <h3 className="font-semibold mb-3">Address</h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">City:</span> {property.address.city}
                      </div>
                      {property.address.region && (
                        <div>
                          <span className="font-medium">Region:</span> {property.address.region}
                        </div>
                      )}
                      {property.address.street && (
                        <div>
                          <span className="font-medium">Street:</span> {property.address.street}
                        </div>
                      )}
                      {property.address.number && (
                        <div>
                          <span className="font-medium">Number:</span> {property.address.number}
                        </div>
                      )}
                      {property.address.postalCode && (
                        <div>
                          <span className="font-medium">Postal Code:</span> {property.address.postalCode}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Country:</span> {property.address.country}
                      </div>
                    </div>
                    {property.address.locationText && (
                      <div className="mt-3">
                        <span className="font-medium">Additional Info:</span>
                        <p className="mt-1 text-muted-foreground">{property.address.locationText}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Listing Information */}
          {property.listing && (
            <Card>
              <CardHeader>
                <CardTitle>Listing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium">Marketing Status:</span>
                  <Badge variant="outline" className="ml-2 capitalize">
                    {property.listing.marketingStatus.toLowerCase()}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">List Price:</span>
                  <div className="text-lg font-semibold">{formatPrice(property.listing.listPrice)}</div>
                </div>
                {property.listing.publishedAt && (
                  <div>
                    <span className="font-medium">Published:</span>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(property.listing.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {property.listing.notes && (
                  <div>
                    <span className="font-medium">Internal Notes:</span>
                    <p className="mt-1 text-sm text-muted-foreground">{property.listing.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Property Owner */}
          <Card>
            <CardHeader>
              <CardTitle>Created By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{property.creator.name || "Unknown"}</div>
                  <div className="text-sm text-muted-foreground">{property.creator.email}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Created {new Date(property.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyTimeline 
                interactions={property.interactions}
                notes={property.notes}
                tasks={property.tasks}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}