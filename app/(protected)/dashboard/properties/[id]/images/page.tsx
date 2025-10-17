import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getProperty } from "@/actions/properties";
import { canCreateContent } from "@/lib/roles";
import { constructMetadata } from "@/lib/utils";
import { PropertyImagePageWrapper } from "@/components/properties/property-image-page-wrapper";

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

  if (!canCreateContent(user.role)) {
    redirect("/dashboard/properties");
  }

  try {
    const property = await getProperty(params.id);

    return (
      <PropertyImagePageWrapper
        propertyId={params.id}
        propertyType={property.propertyType}
        city={property.address?.city || "Unknown"}
      />
    );
  } catch (error) {
    redirect("/dashboard/properties");
  }
}
