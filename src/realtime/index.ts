/**
 * Realtime Layer - Public API
 * 
 * This file exports all public APIs for the realtime layer.
 * Import from this file to access realtime functionality.
 */

// Worker and instance management
export { RealtimeWorker } from './worker';
export { 
  getRealtimeWorker, 
  initializeRealtimeWorker, 
  shutdownRealtimeWorker,
  subscribeToOrganizationEvents,
  unsubscribeFromOrganizationEvents,
  getWorkerStatus
} from './instance';

// Connection management
export { connectionManager } from './connection-manager';

// Types
export * from './types/realtime';
