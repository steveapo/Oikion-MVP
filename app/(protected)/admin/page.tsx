import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import InfoCard from "@/components/dashboard/info-card";
import TransactionsList from "@/components/dashboard/transactions-list";

export async function generateMetadata() {
  return constructMetadata({
    title: "Admin - Oikion",
    description: "Administrative dashboard and settings",
  });
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");
  
  return (
    <>
      <DashboardHeader
        heading="Admin Dashboard"
        text="Manage your application settings and data"
      />
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard />
          <InfoCard />
          <InfoCard />
          <InfoCard />
        </div>
        <TransactionsList />
        <TransactionsList />
      </div>
    </>
  );
}
