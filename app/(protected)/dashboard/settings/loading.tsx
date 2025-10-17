import { DashboardHeader } from "@/components/dashboard/header";
import { Skeleton } from "@/components/ui/loading-state";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function DashboardSettingsLoading() {
  return (
    <>
      <DashboardHeader
        heading="Settings"
        text="Manage your account and organization settings."
      />
      <div className="grid gap-6 pb-10">
        {/* Organization Settings Card Skeleton */}
        <Card padding="comfortable">
          <CardHeader>
            <Skeleton variant="text" className="h-6 w-48" />
            <Skeleton variant="text" className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton variant="text" className="h-4 w-32" />
                <Skeleton variant="rectangular" className="h-10 w-full rounded-md" />
                <Skeleton variant="text" className="h-3 w-64" />
              </div>
              <div className="flex justify-end">
                <Skeleton variant="rectangular" className="h-10 w-24 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Settings Sections Skeleton */}
        <div className="divide-y divide-muted space-y-6">
          {/* User Name Form Skeleton */}
          <div className="space-y-4 pt-6 first:pt-0">
            <div className="space-y-2">
              <Skeleton variant="text" className="h-6 w-32" />
              <Skeleton variant="text" className="h-4 w-96" />
            </div>
            <div className="grid gap-4 max-w-xl">
              <div className="space-y-2">
                <Skeleton variant="text" className="h-4 w-16" />
                <Skeleton variant="rectangular" className="h-10 w-full rounded-md" />
              </div>
              <Skeleton variant="rectangular" className="h-10 w-24 rounded-md" />
            </div>
          </div>

          {/* Delete Organization Section Skeleton */}
          <div className="space-y-4 pt-6">
            <div className="space-y-2">
              <Skeleton variant="text" className="h-6 w-48" />
              <Skeleton variant="text" className="h-4 w-full max-w-2xl" />
            </div>
            <Skeleton variant="rectangular" className="h-10 w-48 rounded-md" />
          </div>

          {/* Delete Account Section Skeleton */}
          <div className="space-y-4 pt-6">
            <div className="space-y-2">
              <Skeleton variant="text" className="h-6 w-40" />
              <Skeleton variant="text" className="h-4 w-full max-w-2xl" />
            </div>
            <Skeleton variant="rectangular" className="h-10 w-40 rounded-md" />
          </div>
        </div>
      </div>
    </>
  );
}
