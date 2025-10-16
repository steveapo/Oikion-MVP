import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Home, Users, FileText, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { StatGrid, StatCard } from "@/components/ui/stat-grid";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = constructMetadata({
  title: "Dashboard – SaaS Starter",
  description: "Create and manage content.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <Container maxWidth="2xl">
      <Section spacing="comfortable">
        <PageHeader
          title="Dashboard"
          description={`Welcome back! Current Role: ${user?.role}`}
          spacing="comfortable"
        />

        {/* Stats Overview */}
        <StatGrid cols={4}>
          <StatCard
            icon={Home}
            label="Total Properties"
            value="0"
            variant="brand"
            change={{ value: "No change", trend: "neutral" }}
          />
          <StatCard
            icon={Users}
            label="Active Clients"
            value="0"
            variant="success"
          />
          <StatCard
            icon={FileText}
            label="Listings"
            value="0"
            variant="default"
          />
          <StatCard
            icon={TrendingUp}
            label="This Month"
            value="€0"
            variant="default"
          />
        </StatGrid>

        {/* Quick Actions */}
        <Card elevation="e0" padding="comfortable">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Home}
              title="Get started with Oikion"
              description="Begin by adding your first property or importing your existing listings."
              action={{
                label: "Add Property",
                onClick: () => {},
              }}
            />
          </CardContent>
        </Card>
      </Section>
    </Container>
  );
}
