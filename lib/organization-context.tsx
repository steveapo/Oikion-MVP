"use client";

import { createContext, useContext, useCallback, useState, ReactNode } from "react";

type OrganizationEventType = "switch" | "create" | "update" | "delete";

interface OrganizationContextValue {
  // Event counter to trigger re-fetches only when needed
  eventCounter: number;
  // Trigger a reload event (for org switch, create, update, delete)
  triggerReload: (eventType: OrganizationEventType) => void;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [eventCounter, setEventCounter] = useState(0);

  const triggerReload = useCallback((eventType: OrganizationEventType) => {
    console.log(`[ORG CONTEXT] Triggering reload for event: ${eventType}`);
    setEventCounter((prev) => prev + 1);
  }, []);

  return (
    <OrganizationContext.Provider value={{ eventCounter, triggerReload }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganizationContext must be used within OrganizationProvider");
  }
  return context;
}
