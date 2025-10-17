import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/loading-state";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function MembersLoading() {
  return (
    <Container maxWidth="2xl">
      <Section spacing="comfortable">
        {/* Page Header Skeleton */}
        <div className="space-y-2 pb-6">
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="text" className="h-9 w-32" />
          <Skeleton variant="text" className="h-5 w-64" />
        </div>

        {/* Invite Form Card Skeleton */}
        <Card padding="comfortable">
          <CardHeader>
            <Skeleton variant="text" className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-4 w-16" />
                  <Skeleton variant="rectangular" className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-4 w-16" />
                  <Skeleton variant="rectangular" className="h-10 w-full rounded-md" />
                </div>
              </div>
              <Skeleton variant="rectangular" className="h-10 w-32 rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations Skeleton */}
        <div className="space-y-4">
          <Skeleton variant="text" className="h-6 w-48" />
          <Card padding="comfortable">
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4 flex-1">
                      <Skeleton variant="circular" className="size-10" />
                      <div className="space-y-2 flex-1">
                        <Skeleton variant="text" className="h-5 w-48" />
                        <Skeleton variant="text" className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton variant="rectangular" className="h-9 w-24 rounded-md" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members List Skeleton */}
        <div className="space-y-4">
          <Skeleton variant="text" className="h-6 w-32" />
          <Card padding="comfortable">
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4 flex-1">
                      <Skeleton variant="circular" className="size-12" />
                      <div className="space-y-2 flex-1">
                        <Skeleton variant="text" className="h-5 w-40" />
                        <Skeleton variant="text" className="h-4 w-56" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton variant="rectangular" className="h-8 w-24 rounded-full" />
                      <Skeleton variant="rectangular" className="h-9 w-9 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </Container>
  );
}
