import { getCurrentUser } from "@/lib/session";
import { canCreateContent } from "@/lib/roles";
import { redirect } from "@/i18n/navigation";
import { constructMetadata } from "@/lib/utils";
import dynamic from "next/dynamic";
const PropertyForm = dynamic(() => import("@/components/properties/property-form").then(m => m.PropertyForm), {
  loading: () => <div className="h-80 rounded-lg border p-4"><div className="h-6 w-48 bg-muted animate-pulse rounded mb-4" /><div className="h-60 bg-muted animate-pulse rounded" /></div>,
  ssr: false,
});

export const metadata = constructMetadata({
  title: "Add New Property - Oikion",
  description: "Add a new property to your MLS inventory.",
});

export default async function NewPropertyPage() {
  const user = await getCurrentUser();
  
  if (!user || !user.id) {
    redirect("/login");
  }

  if (!canCreateContent(user!.role)) {
    redirect("/dashboard/properties");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Property</h1>
        <p className="text-muted-foreground">
          Create a new property listing for your MLS inventory.
        </p>
      </div>

      <PropertyForm />
    </div>
  );
}