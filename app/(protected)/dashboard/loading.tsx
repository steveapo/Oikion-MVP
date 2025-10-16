import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/loading-state";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <Container maxWidth="2xl">
      <Section spacing="comfortable">
        {/* Page Header Skeleton */}
        <div className="space-y-2 pb-6">
          <Skeleton variant="text" className="h-9 w-48" />
          <Skeleton variant="text" className="h-5 w-64" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} padding="comfortable">
              <CardContent className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <Skeleton variant="text" className="h-4 w-24" />
                  <Skeleton variant="text" className="h-8 w-16" />
                </div>
                <Skeleton variant="rectangular" className="size-10 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Card Skeleton */}
        <Card padding="comfortable">
          <CardHeader>
            <Skeleton variant="text" className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Skeleton variant="circular" className="size-16" />
              <div className="space-y-2 text-center">
                <Skeleton variant="text" className="h-6 w-48 mx-auto" />
                <Skeleton variant="text" className="h-4 w-64 mx-auto" />
              </div>
              <Skeleton variant="rectangular" className="h-10 w-32 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </Section>
    </Container>
  );
}
