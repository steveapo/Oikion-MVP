/**
 * Realtime Event Types and Payloads
 * 
 * This file defines all TypeScript types and interfaces for the realtime system.
 * It includes:
 * 
 * 1. Event payload structures for different event types
 * 2. Subscription and connection management types
 * 3. Error handling and status types
 * 4. Channel and routing types
 * 5. Authentication and authorization types
 * 
 * These types ensure type safety across the realtime layer and provide
 * clear contracts for event handling and data flow.
 */

/**
 * Base event structure that all realtime events must extend
 */
export interface BaseEvent {
  id: string;
  type: string;
  timestamp: number;
  source: string;
  version: string;
}

/**
 * Event types supported by the realtime system
 */
export type EventType = 
  | 'user.activity'
  | 'property.update'
  | 'member.join'
  | 'member.leave'
  | 'organization.change'
  | 'notification.new'
  | 'system.alert'
  | 'data.sync';

/**
 * Event channels for organizing and filtering events
 */
export type EventChannel = 
  | 'user'
  | 'property'
  | 'organization'
  | 'system'
  | 'notifications';

/**
 * User activity event payload
 */
export interface UserActivityEvent extends BaseEvent {
  type: 'user.activity';
  payload: {
    userId: string;
    action: string;
    resource: string;
    metadata?: Record<string, any>;
  };
}

/**
 * Property update event payload
 */
export interface PropertyUpdateEvent extends BaseEvent {
  type: 'property.update';
  payload: {
    propertyId: string;
    organizationId: string;
    // Operation that triggered the event
    operation: 'create' | 'update' | 'archive' | 'delete';
    // Optional list of updated fields for update operations
    updatedFields?: string[];
    // Arbitrary changes payload for consumers that need diffs
    changes?: Record<string, any>;
    updatedBy: string;
  };
}

/**
 * Member join event payload
 */
export interface MemberJoinEvent extends BaseEvent {
  type: 'member.join';
  payload: {
    memberId: string;
    organizationId: string;
    role: string;
    invitedBy: string;
  };
}

/**
 * Member leave event payload
 */
export interface MemberLeaveEvent extends BaseEvent {
  type: 'member.leave';
  payload: {
    memberId: string;
    organizationId: string;
    reason?: string;
  };
}

/**
 * Organization change event payload
 */
export interface OrganizationChangeEvent extends BaseEvent {
  type: 'organization.change';
  payload: {
    organizationId: string;
    changeType: 'name' | 'settings' | 'permissions' | 'billing';
    changes: Record<string, any>;
    updatedBy: string;
  };
}

/**
 * Notification event payload
 */
export interface NotificationEvent extends BaseEvent {
  type: 'notification.new';
  payload: {
    userId: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    metadata?: Record<string, any>;
  };
}

/**
 * System alert event payload
 */
export interface SystemAlertEvent extends BaseEvent {
  type: 'system.alert';
  payload: {
    alertType: 'error' | 'warning' | 'info' | 'success';
    message: string;
    affectedUsers?: string[];
    metadata?: Record<string, any>;
  };
}

/**
 * Data synchronization event payload
 */
export interface DataSyncEvent extends BaseEvent {
  type: 'data.sync';
  payload: {
    entityType: string;
    entityId: string;
    operation: 'create' | 'update' | 'delete';
    data: Record<string, any>;
  };
}

/**
 * Union type for all possible event payloads
 */
export type RealtimeEvent = 
  | UserActivityEvent
  | PropertyUpdateEvent
  | MemberJoinEvent
  | MemberLeaveEvent
  | OrganizationChangeEvent
  | NotificationEvent
  | SystemAlertEvent
  | DataSyncEvent;

/**
 * Subscription request structure
 */
export interface SubscriptionRequest {
  channel: EventChannel;
  eventTypes?: EventType[];
  filters?: Record<string, any>;
  userId: string;
  organizationId?: string;
}

/**
 * Subscription response structure
 */
export interface SubscriptionResponse {
  subscriptionId: string;
  channel: EventChannel;
  status: 'active' | 'paused' | 'error';
  createdAt: number;
  expiresAt?: number;
}

/**
 * Connection status types
 */
export type ConnectionStatus = 
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'reconnecting';

/**
 * Connection information
 */
export interface ConnectionInfo {
  id: string;
  status: ConnectionStatus;
  userId: string;
  organizationId?: string;
  connectedAt: number;
  lastActivity: number;
  subscriptions: string[];
}

/**
 * Event filter structure for subscription filtering
 */
export interface EventFilter {
  eventTypes?: EventType[];
  channels?: EventChannel[];
  userIds?: string[];
  organizationIds?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
  customFilters?: Record<string, any>;
}

/**
 * Error types for realtime operations
 */
export interface RealtimeError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
}

/**
 * Event delivery status
 */
export type DeliveryStatus = 
  | 'pending'
  | 'delivered'
  | 'failed'
  | 'retrying';

/**
 * Event delivery information
 */
export interface EventDelivery {
  eventId: string;
  subscriptionId: string;
  status: DeliveryStatus;
  attempts: number;
  lastAttempt: number;
  error?: RealtimeError;
}

/**
 * Configuration for realtime worker
 */
export interface RealtimeConfig {
  maxConnections: number;
  maxSubscriptionsPerConnection: number;
  heartbeatInterval: number;
  reconnectAttempts: number;
  eventRetentionPeriod: number;
  enablePersistence: boolean;
}

/**
 * Statistics for realtime system monitoring
 */
export interface RealtimeStats {
  activeConnections: number;
  totalSubscriptions: number;
  eventsProcessed: number;
  eventsDelivered: number;
  eventsFailed: number;
  averageLatency: number;
  uptime: number;
}
