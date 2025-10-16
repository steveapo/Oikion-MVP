import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/loading-state";
import { Card, CardContent } from "@/components/ui/card";

export default function PropertiesLoading() {
  return (
    <Container maxWidth="2xl">
      <Section spacing="comfortable">
        {/* Page Header Skeleton */}
        <div className="flex items-center justify-between pb-6">
          <div className="space-y-2">
            <Skeleton variant="text" className="h-9 w-48" />
            <Skeleton variant="text" className="h-5 w-96" />
          </div>
          <Skeleton variant="rectangular" className="h-10 w-36 rounded-md" />
        </div>

        {/* Filters Skeleton */}
        <Card padding="comfortable">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton variant="text" className="h-4 w-20" />
                  <Skeleton variant="rectangular" className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} padding="comfortable">
              <CardContent className="space-y-4">
                <Skeleton variant="rectangular" className="h-48 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-6 w-3/4" />
                  <Skeleton variant="text" className="h-4 w-full" />
                  <Skeleton variant="text" className="h-4 w-2/3" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton variant="text" className="h-5 w-24" />
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
