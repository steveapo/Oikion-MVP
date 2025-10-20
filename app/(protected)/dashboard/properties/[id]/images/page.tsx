import { redirect } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { getProperty } from "@/actions/properties";
import { canCreateContent } from "@/lib/roles";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { PropertyImageManager } from "@/components/properties/property-image-manager";

export const metadata = constructMetadata({
  title: "Manage Property Images - Oikion",
  description: "Upload and manage property images.",
});

interface PropertyImagesPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyImagesPage({ params }: PropertyImagesPageProps) {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  if (!canCreateContent(user!.role)) {
    redirect("/dashboard/properties");
  }

  try {
    const property = await getProperty(params.id);

    return (
      <div className="space-y-6">
        <DashboardHeader
          heading="Manage Property Images"
          text={`Upload photos for ${property.propertyType.toLowerCase()} in ${property.address?.city || "Unknown"}`}
        >
          <Link href={`/dashboard/properties/${params.id}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Property
            </Button>
          </Link>
        </DashboardHeader>

        <div className="mx-auto max-w-4xl">
          <PropertyImageManager
            propertyId={params.id}
            onUploadComplete={() => {
              // Refresh the page or redirect
              window.location.href = `/dashboard/properties/${params.id}`;
            }}
          />
        </div>
      </div>
    );
  } catch (error) {
    redirect("/dashboard/properties");
  }
}
