"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePropertyEvents } from "@/hooks/use-property-events";

interface PropertiesListRealtimeProps {
  organizationId: string;
}

/**
 * Client-only bridge that subscribes to property realtime events and refreshes the page
 * when relevant updates occur. Render this alongside the server-rendered list.
 */
export default function PropertiesListRealtime({ organizationId }: PropertiesListRealtimeProps) {
  const router = useRouter();

  const handleEvent = useCallback((_event: any) => {
    // Minimal: refresh to pick up new data (leverages server action caching + tags)
    router.refresh();
  }, [router]);

  usePropertyEvents(organizationId, handleEvent);

  return null;
}


