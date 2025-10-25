/**
 * Realtime Connection Manager
 * 
 * Manages active SSE connections and routes events to connected clients.
 * Provides efficient event distribution and connection lifecycle management.
 */

import { RealtimeEvent } from './types/realtime';

interface Connection {
  id: string;
  controller: ReadableStreamDefaultController;
  userId: string;
  organizationId: string;
  channel?: string;
  connectedAt: number;
  lastActivity: number;
}

class ConnectionManager {
  private connections: Map<string, Connection> = new Map();
  private connectionsByOrg: Map<string, Set<string>> = new Map();

  /**
   * Register a new SSE connection
   */
  addConnection(
    connectionId: string,
    controller: ReadableStreamDefaultController,
    userId: string,
    organizationId: string,
    channel?: string | undefined
  ): void {
    const connection: Connection = {
      id: connectionId,
      controller,
      userId,
      organizationId,
      channel,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
    };

    this.connections.set(connectionId, connection);

    // Track connections by organization for efficient filtering
    if (!this.connectionsByOrg.has(organizationId)) {
      this.connectionsByOrg.set(organizationId, new Set());
    }
    this.connectionsByOrg.get(organizationId)!.add(connectionId);

    console.log(`[ConnectionManager] Added connection: ${connectionId}`, {
      userId,
      organizationId,
      channel,
      totalConnections: this.connections.size,
    });
  }

  /**
   * Remove a connection
   */
  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    // Remove from organization tracking
    const orgConnections = this.connectionsByOrg.get(connection.organizationId);
    if (orgConnections) {
      orgConnections.delete(connectionId);
      if (orgConnections.size === 0) {
        this.connectionsByOrg.delete(connection.organizationId);
      }
    }

    this.connections.delete(connectionId);

    console.log(`[ConnectionManager] Removed connection: ${connectionId}`, {
      totalConnections: this.connections.size,
    });
  }

  /**
   * Send an event to all connections in a specific organization
   */
  broadcastToOrganization(organizationId: string, event: RealtimeEvent): void {
    const orgConnectionIds = this.connectionsByOrg.get(organizationId);
    if (!orgConnectionIds || orgConnectionIds.size === 0) {
      return;
    }

    let successCount = 0;
    let failCount = 0;

    const connectionIds = Array.from(orgConnectionIds);
    for (const connectionId of connectionIds) {
      const connection = this.connections.get(connectionId);
      if (!connection) {
        continue;
      }

      // Check if event matches channel filter
      if (connection.channel && connection.channel !== 'all') {
        // TODO: Implement channel filtering logic
        // For now, send to all channels
      }

      try {
        const message = `data: ${JSON.stringify(event)}\n\n`;
        connection.controller.enqueue(new TextEncoder().encode(message));
        connection.lastActivity = Date.now();
        successCount++;
      } catch (error) {
        console.error(`[ConnectionManager] Error sending to connection ${connectionId}:`, error);
        // Connection is broken, remove it
        this.removeConnection(connectionId);
        failCount++;
      }
    }

    console.log(`[ConnectionManager] Broadcast to organization ${organizationId}:`, {
      successCount,
      failCount,
      eventType: event.type,
    });
  }

  /**
   * Send an event to a specific connection
   */
  sendToConnection(connectionId: string, event: RealtimeEvent): void {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      console.warn(`[ConnectionManager] Connection not found: ${connectionId}`);
      return;
    }

    try {
      const message = `data: ${JSON.stringify(event)}\n\n`;
      connection.controller.enqueue(new TextEncoder().encode(message));
      connection.lastActivity = Date.now();
    } catch (error) {
      console.error(`[ConnectionManager] Error sending to connection ${connectionId}:`, error);
      this.removeConnection(connectionId);
    }
  }

  /**
   * Get all active connections for an organization
   */
  getOrganizationConnections(organizationId: string): Connection[] {
    const connectionIds = this.connectionsByOrg.get(organizationId);
    if (!connectionIds) {
      return [];
    }

    const connections: Connection[] = [];
    const ids = Array.from(connectionIds);
    for (const id of ids) {
      const connection = this.connections.get(id);
      if (connection) {
        connections.push(connection);
      }
    }

    return connections;
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const orgStats = new Map<string, number>();
    const orgEntries = Array.from(this.connectionsByOrg.entries());
    for (const [orgId, connections] of orgEntries) {
      orgStats.set(orgId, connections.size);
    }

    return {
      totalConnections: this.connections.size,
      organizationCount: this.connectionsByOrg.size,
      connectionsByOrg: Object.fromEntries(orgStats),
    };
  }

  /**
   * Clean up stale connections (connections with no activity for a long time)
   */
  cleanupStaleConnections(maxIdleTime: number = 5 * 60 * 1000): void {
    const now = Date.now();
    const staleConnections: string[] = [];

    const connectionEntries = Array.from(this.connections.entries());
    for (const [id, connection] of connectionEntries) {
      if (now - connection.lastActivity > maxIdleTime) {
        staleConnections.push(id);
      }
    }

    for (const id of staleConnections) {
      console.log(`[ConnectionManager] Cleaning up stale connection: ${id}`);
      this.removeConnection(id);
    }

    if (staleConnections.length > 0) {
      console.log(`[ConnectionManager] Cleaned up ${staleConnections.length} stale connections`);
    }
  }
}

// Export singleton instance
export const connectionManager = new ConnectionManager();
