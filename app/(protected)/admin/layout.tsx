import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { canAccessAdmin } from "@/lib/roles";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();
  
  // Allow both ORG_OWNER and ADMIN roles to access admin features
  if (!user || !canAccessAdmin(user.role)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
