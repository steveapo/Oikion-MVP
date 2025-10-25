"use client";

import { useEffect, useRef } from "react";

type PropertyEventPayload = {
  propertyId: string;
  organizationId: string;
  operation: 'create' | 'update' | 'archive' | 'delete';
  updatedFields?: string[];
  changes?: Record<string, any>;
  updatedBy: string;
};

type RealtimeEvent = {
  id: string;
  type: 'property.update' | string;
  timestamp: number;
  source: string;
  version: string;
  payload: PropertyEventPayload;
};

/**
 * Subscribe to property realtime events for an organization.
 * Ensures a single EventSource per component lifecycle and auto-cleans on unmount.
 */
export function usePropertyEvents(
  organizationId: string,
  onEvent: (event: RealtimeEvent) => void
) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    const url = `/api/realtime/stream?organizationId=${encodeURIComponent(organizationId)}&channel=property`;
    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as RealtimeEvent;
        if (data?.type === 'property.update') {
          onEvent(data);
        }
      } catch (_) {
        // ignore non-JSON messages (e.g., heartbeats)
      }
    };

    const handleError = () => {
      // Let the browser auto-reconnect; no-op here to avoid loops
    };

    es.addEventListener('message', handleMessage);
    es.addEventListener('error', handleError as any);

    return () => {
      es.removeEventListener('message', handleMessage);
      es.removeEventListener('error', handleError as any);
      es.close();
      eventSourceRef.current = null;
    };
  }, [organizationId, onEvent]);
}


