import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

/**
 * Loading skeleton for contact card
 * Matches the layout of ContactServerCard
 */
export function ContactCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar skeleton */}
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              {/* Name skeleton */}
              <div className="h-6 bg-muted rounded animate-pulse w-40" />
              {/* Badges skeleton */}
              <div className="flex items-center space-x-2">
                <div className="h-5 bg-muted rounded animate-pulse w-16" />
                <div className="h-5 bg-muted rounded animate-pulse w-20" />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Contact methods skeleton */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-48" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-32" />
          </div>
        </div>

        {/* Statistics skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <div className="h-4 bg-muted rounded animate-pulse w-24" />
            <div className="h-4 bg-muted rounded animate-pulse w-20" />
            <div className="h-4 bg-muted rounded animate-pulse w-20" />
          </div>
        </div>

        {/* Last interaction skeleton */}
        <div className="h-3 bg-muted rounded animate-pulse w-36" />
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3">
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
 * Grid of contact card skeletons
 */
export function ContactListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ContactCardSkeleton key={i} />
      ))}
    </div>
  );
}
