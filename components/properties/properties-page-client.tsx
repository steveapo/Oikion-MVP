"use client";

import { useLiveUpdates } from "@/hooks/use-live-updates";

/**
 * Client-side component that subscribes to property live updates
 * Renders nothing but subscribes to updates for the entire properties page
 */
export function PropertiesPageClient({ organizationId }: { organizationId: string | null | undefined }) {
  // Subscribe to property updates
  // When a property is created, updated, or deleted, router.refresh() is called automatically
  useLiveUpdates(
    ["property"],
    organizationId
  );

  return null;
}
