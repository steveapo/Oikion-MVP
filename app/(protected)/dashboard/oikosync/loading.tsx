import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/loading-state";
import { Card, CardContent } from "@/components/ui/card";

export default function OikosyncLoading() {
  return (
    <Container maxWidth="2xl">
      <Section spacing="comfortable">
        {/* Page Header Skeleton */}
        <div className="space-y-2 pb-6">
          <Skeleton variant="text" className="h-9 w-56" />
          <Skeleton variant="text" className="h-5 w-96" />
        </div>

        {/* Filter Pills Skeleton */}
        <div className="flex items-center gap-2 pb-4">
          <Skeleton variant="text" className="h-4 w-16" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>

        {/* Activity Feed Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} padding="comfortable">
              <CardContent>
                <div className="flex items-start gap-4">
                  <Skeleton variant="circular" className="size-10 mt-1" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton variant="text" className="h-5 w-3/4" />
                        <Skeleton variant="text" className="h-4 w-full" />
                      </div>
                      <Skeleton variant="text" className="h-4 w-20" />
                    </div>
                    {i % 3 === 0 && (
                      <Skeleton variant="rectangular" className="h-20 w-full rounded-md" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between pt-4">
          <Skeleton variant="text" className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" className="h-10 w-24 rounded-md" />
            <Skeleton variant="rectangular" className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </Section>
    </Container>
  );
}
