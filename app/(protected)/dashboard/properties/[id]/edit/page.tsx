import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canCreateContent, canDeleteContent } from "@/lib/roles";
import { getProperty } from "@/actions/properties";
import { constructMetadata } from "@/lib/utils";
import dynamic from "next/dynamic";
const PropertyForm = dynamic(() => import("@/components/properties/property-form").then(m => m.PropertyForm), {
  loading: () => <div className="h-80 rounded-lg border p-4"><div className="h-6 w-48 bg-muted animate-pulse rounded mb-4" /><div className="h-60 bg-muted animate-pulse rounded" /></div>,
  ssr: false,
});
import { ArchivePropertyButton } from "@/components/properties/archive-property-button";

interface EditPropertyPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EditPropertyPageProps) {
  try {
    const property = await getProperty(params.id);
    const location = property.address 
      ? [property.address.city, property.address.region].filter(Boolean).join(", ")
      : "Property";
    
    return constructMetadata({
      title: `Edit ${property.propertyType} in ${location} - Oikion`,
      description: `Edit property details for ${property.propertyType.toLowerCase()} in ${location}`,
    });
  } catch {
    return constructMetadata({
      title: "Edit Property - Oikion",
      description: "Edit property details.",
    });
  }
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const user = await getCurrentUser();
  
  if (!user || !user.id) {
    redirect("/login");
  }

  if (!canCreateContent(user!.role)) {
    redirect("/dashboard/properties");
  }

  let property;
  try {
    property = await getProperty(params.id);
  } catch {
    notFound();
  }

  const canArchive = canDeleteContent(user!.role, property.createdBy === user!.id);

  const displayLocation = property.address 
    ? [property.address.city, property.address.region].filter(Boolean).join(", ")
    : "Unknown Location";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Edit {property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()}
          </h1>
          <p className="text-muted-foreground">
            Update property details for {displayLocation}.
          </p>
        </div>
        {canArchive && (
          <ArchivePropertyButton 
            propertyId={params.id} 
            propertyName={`${property.propertyType} in ${displayLocation}`}
          />
        )}
      </div>

      <PropertyForm property={property} />
    </div>
  );
}