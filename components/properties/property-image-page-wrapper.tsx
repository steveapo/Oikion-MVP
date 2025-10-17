"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { PropertyImageManager } from "@/components/properties/property-image-manager";

interface PropertyImagePageWrapperProps {
  propertyId: string;
  propertyType: string;
  city: string;
}

export function PropertyImagePageWrapper({
  propertyId,
  propertyType,
  city,
}: PropertyImagePageWrapperProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Manage Property Images"
        text={`Upload photos for ${propertyType.toLowerCase()} in ${city}`}
      >
        <Link href={`/dashboard/properties/${propertyId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Property
          </Button>
        </Link>
      </DashboardHeader>

      <div className="mx-auto max-w-4xl">
        <PropertyImageManager
          propertyId={propertyId}
          onUploadComplete={() => {
            router.push(`/dashboard/properties/${propertyId}`);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
