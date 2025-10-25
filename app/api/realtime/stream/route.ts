/**
 * Live Events API Route
 * 
 * This API route handles real-time event streaming for the application.
 * It provides Server-Sent Events (SSE) endpoint for real-time data streaming.
 * 
 * Features:
 * - Authentication and authorization
 * - Organization-based event filtering
 * - Connection management and cleanup
 * - Event broadcasting to connected clients
 * 
 * Integration points:
 * - Event types from src/realtime/types/realtime.ts
 * - Worker from src/realtime/worker.ts
 * - Authentication system from auth.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { RealtimeEvent, EventChannel } from '@/src/realtime/types/realtime';
import { connectionManager } from '@/src/realtime/connection-manager';
import { getRealtimeWorker, subscribeToOrganizationEvents } from '@/src/realtime/instance';

/**
 * GET /api/realtime/stream
 * 
 * Establishes a Server-Sent Events connection for real-time data streaming.
 * Requires authentication and validates organization access.
 * 
 * Query Parameters:
 * - organizationId: Organization ID for filtering events (required)
 * - channel: Event channel to subscribe to (optional)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');
  const channel = searchParams.get('channel') as EventChannel | null;

  // Authenticate user
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { 
      status: 401,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }

  // Validate required parameters
  if (!organizationId) {
    return new NextResponse('Missing required parameter: organizationId', { 
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }

  // Verify user has access to the organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: organizationId,
      },
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          isPersonal: true,
        },
      },
    },
  });

  if (!membership) {
    return new NextResponse('Forbidden: No access to this organization', { 
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }

  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
    // CORS headers (restrict to your domain in production)
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
      ? (process.env.NEXT_PUBLIC_APP_URL || '*')
      : '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  // Create readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // TypeScript guard: we already checked session.user.id above
      if (!session.user?.id) {
        controller.close();
        return;
      }

      const userId = session.user.id;
      const connectionId = `${userId}-${organizationId}-${Date.now()}`;
      
      // Register connection with connection manager
      connectionManager.addConnection(
        connectionId,
        controller,
        userId,
        organizationId,
        channel ? channel : undefined
      );

      // Send initial connection event
      const initialEvent = {
        type: 'connection',
        status: 'connected',
        timestamp: Date.now(),
        organizationId,
        organizationName: membership.organization.name,
        channel: channel || 'all',
        userId: userId,
      };
      
      const initialMessage = `data: ${JSON.stringify(initialEvent)}\n\n`;
      controller.enqueue(new TextEncoder().encode(initialMessage));

      // Set up heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `: heartbeat ${Date.now()}\n\n`;
          controller.enqueue(new TextEncoder().encode(heartbeat));
        } catch (error) {
          console.error('[SSE] Error sending heartbeat:', error);
          clearInterval(heartbeatInterval);
          connectionManager.removeConnection(connectionId);
        }
      }, 30000); // Send heartbeat every 30 seconds

      // Subscribe to organization events from the worker
      const eventCallback = (event: RealtimeEvent) => {
        try {
          connectionManager.sendToConnection(connectionId, event);
        } catch (error) {
          console.error('[SSE] Error sending event to connection:', error);
        }
      };

      // Set up event subscription
      subscribeToOrganizationEvents(organizationId, eventCallback)
        .then(() => {
          console.log(`[SSE] Subscribed to organization events: ${organizationId}`);
        })
        .catch((error) => {
          console.error('[SSE] Error subscribing to organization events:', error);
        });

      console.log(`[SSE] New connection established: ${connectionId}`, {
        userId: userId,
        organizationId,
        organizationName: membership.organization.name,
        channel: channel || 'all',
      });

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected: ${connectionId}`);
        clearInterval(heartbeatInterval);
        connectionManager.removeConnection(connectionId);
        controller.close();
      });
    },
    
    cancel() {
      console.log('[SSE] Stream cancelled');
    }
  });

  return new NextResponse(stream, { headers });
}

/**
 * OPTIONS /api/realtime/stream
 * 
 * Handles CORS preflight requests for the realtime API.
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? (process.env.NEXT_PUBLIC_APP_URL || '*')
        : '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}
