/**
 * Realtime Worker Singleton Instance
 * 
 * This file provides a singleton instance of the RealtimeWorker that can be
 * shared across the application. It ensures only one worker instance is running
 * and provides a clean API for subscribing to events.
 */

import { RealtimeWorker } from './worker';
import { RealtimeEvent } from './types/realtime';

let workerInstance: RealtimeWorker | null = null;
let isInitialized = false;

/**
 * Get the singleton worker instance
 */
export function getRealtimeWorker(): RealtimeWorker {
  if (!workerInstance) {
    workerInstance = new RealtimeWorker();
  }
  return workerInstance;
}

/**
 * Initialize the realtime worker (should be called once on app startup)
 */
export async function initializeRealtimeWorker(): Promise<void> {
  if (isInitialized) {
    console.log('[Realtime] Worker already initialized');
    return;
  }

  try {
    const worker = getRealtimeWorker();
    await worker.start();
    isInitialized = true;
    console.log('[Realtime] Worker initialized successfully');
  } catch (error) {
    console.error('[Realtime] Failed to initialize worker:', error);
    throw error;
  }
}

/**
 * Shutdown the realtime worker (called on app shutdown)
 */
export async function shutdownRealtimeWorker(): Promise<void> {
  if (!workerInstance || !isInitialized) {
    return;
  }

  try {
    await workerInstance.stop();
    isInitialized = false;
    console.log('[Realtime] Worker shutdown successfully');
  } catch (error) {
    console.error('[Realtime] Error shutting down worker:', error);
  }
}

/**
 * Subscribe to realtime events for a specific organization
 */
export async function subscribeToOrganizationEvents(
  organizationId: string,
  callback: (event: RealtimeEvent) => void
): Promise<void> {
  const worker = getRealtimeWorker();
  await worker.subscribe(`org:${organizationId}`, callback);
}

/**
 * Unsubscribe from organization events
 */
export async function unsubscribeFromOrganizationEvents(
  organizationId: string
): Promise<void> {
  const worker = getRealtimeWorker();
  await worker.unsubscribe(`org:${organizationId}`);
}

/**
 * Get worker status
 */
export function getWorkerStatus() {
  if (!workerInstance) {
    return {
      isRunning: false,
      subscriptions: 0,
      reconnectAttempts: 0,
    };
  }
  return workerInstance.getStatus();
}

/**
 * Publish a property event to all subscribers of the organization
 */
export function publishPropertyEvent(params: {
  operation: 'create' | 'update' | 'archive' | 'delete';
  propertyId: string;
  organizationId: string;
  updatedBy: string;
  updatedFields?: string[];
  changes?: Record<string, any>;
  source?: string;
}): void {
  const worker = getRealtimeWorker();
  worker.publishPropertyEvent(params);
}
