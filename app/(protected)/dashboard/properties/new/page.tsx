import { getCurrentUser } from "@/lib/session";
import { canCreateContent } from "@/lib/roles";
import { redirect } from "next/navigation";
import { constructMetadata } from "@/lib/utils";
import { PropertyForm } from "@/components/properties/property-form";

export const metadata = constructMetadata({
  title: "Add New Property - Oikion",
  description: "Add a new property to your MLS inventory.",
});

export default async function NewPropertyPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  if (!canCreateContent(user.role)) {
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