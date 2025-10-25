"use client";

import { useSession } from "next-auth/react";
import { useLiveUpdates } from "@/hooks/use-live-updates";
import { ActivityFeed } from "./activity-feed";

interface ActivityItem {
  id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  payload: any;
  createdAt: Date;
  actor: {
    id: string;
    name: string | null;
    email: string | null;
  };
  entityDetails: any;
}

interface ActivityFeedWrapperProps {
  activities: ActivityItem[];
  totalPages: number;
  currentPage: number;
}

/**
 * Client wrapper for ActivityFeed that subscribes to live updates
 * Automatically refreshes when any activity-generating action occurs
 */
export function ActivityFeedWrapper({
  activities,
  totalPages,
  currentPage,
}: ActivityFeedWrapperProps) {
  const { data: session } = useSession();
  
  // Subscribe to ALL entity types to catch all activities
  // Activity feed should show all organization events
  useLiveUpdates(
    ["property", "client", "member", "task", "interaction", "note", "activity"],
    session?.user?.organizationId
  );

  return (
    <ActivityFeed
      activities={activities}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  );
}
