import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

/**
 * Loading skeleton for property card
 * Matches the layout and aspect ratio of PropertyServerCard
 */
export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        {/* Image skeleton - 16:10 aspect ratio */}
        <div className="aspect-[16/10] w-full bg-muted animate-pulse" />
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and location */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded animate-pulse w-24" />
              <div className="h-5 bg-muted rounded animate-pulse w-20 ml-auto" />
            </div>
          </div>

          {/* Property details (beds, baths, size) */}
          <div className="flex items-center gap-4">
            <div className="h-4 bg-muted rounded animate-pulse w-16" />
            <div className="h-4 bg-muted rounded animate-pulse w-16" />
            <div className="h-4 bg-muted rounded animate-pulse w-16" />
          </div>

          {/* Marketing status */}
          <div className="flex items-center justify-between">
            <div className="h-4 bg-muted rounded animate-pulse w-32" />
            <div className="h-4 bg-muted rounded animate-pulse w-24" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="h-3 bg-muted rounded animate-pulse w-24" />
        <div className="flex items-center gap-2">
          <div className="h-9 bg-muted rounded animate-pulse w-20" />
          <div className="h-9 bg-muted rounded animate-pulse w-9" />
        </div>
      </CardFooter>
    </Card>
  );
}

/**
 * Grid of property card skeletons
 */
export function PropertyListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
