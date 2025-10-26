import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { canAccessAdmin } from "@/lib/roles";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user.role)) redirect("/login");

  return <>{children}</>;
}
