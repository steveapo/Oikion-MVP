import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/loading-state";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function RelationsLoading() {
  return (
    <Container maxWidth="2xl">
      <Section spacing="comfortable">
        {/* Page Header Skeleton */}
        <div className="flex items-center justify-between pb-6">
          <div className="space-y-2">
            <Skeleton variant="text" className="h-9 w-48" />
            <Skeleton variant="text" className="h-5 w-80" />
          </div>
          <Skeleton variant="rectangular" className="h-10 w-32 rounded-md" />
        </div>

        {/* Search and Filters Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton variant="rectangular" className="h-10 flex-1 max-w-md rounded-md" />
          <Skeleton variant="rectangular" className="h-10 w-24 rounded-md" />
        </div>

        {/* Contacts Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} elevation="e0" padding="comfortable">
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Skeleton variant="circular" className="size-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="h-5 w-32" />
                    <Skeleton variant="text" className="h-4 w-48" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-4 w-full" />
                  <Skeleton variant="text" className="h-4 w-3/4" />
                </div>
                <div className="flex gap-2">
                  <Skeleton variant="rectangular" className="h-6 w-16 rounded-full" />
                  <Skeleton variant="rectangular" className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </Container>
  );
}
