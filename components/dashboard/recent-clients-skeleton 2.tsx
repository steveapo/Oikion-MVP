import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentClientsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-block h-5 w-40 rounded bg-muted animate-pulse" />
        </CardTitle>
        <CardDescription>
          <span className="inline-block h-4 w-60 rounded bg-muted animate-pulse" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


