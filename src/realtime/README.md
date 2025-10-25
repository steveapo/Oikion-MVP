# Realtime Layer Implementation

## Overview

This realtime layer provides real-time event streaming capabilities for the Oikion application using Prisma Pulse and Server-Sent Events (SSE).

## Architecture

```
src/realtime/
├── worker.ts               # Background worker for Prisma Pulse subscriptions
├── instance.ts            # Singleton worker instance and helper functions
├── connection-manager.ts  # Manages active SSE connections
├── types/realtime.ts      # TypeScript types for events and payloads
├── index.ts               # Public API exports
└── README.md              # This documentation

app/api/realtime/
└── stream/
    └── route.ts           # SSE API endpoint for real-time events
```

## Components

### 1. RealtimeWorker (`worker.ts`)

The background worker that handles Prisma Pulse subscriptions and event processing.

**Key Features:**
- Prisma Pulse subscription management for Property model changes
- Event broadcasting to registered callbacks
- Connection management and error handling
- Reconnection logic with exponential backoff

**Usage:**
```typescript
import { RealtimeWorker } from './src/realtime/worker';

const worker = new RealtimeWorker();
await worker.start();

// Subscribe to events
await worker.subscribe('property', (event) => {
  console.log('Property event received:', event);
});

// Get worker status
const status = worker.getStatus();
```

### 2. Realtime Instance (`instance.ts`)

Provides a singleton instance of the RealtimeWorker with helper functions.

**Features:**
- Singleton pattern for worker management
- Organization-based event subscriptions
- Worker lifecycle management
- Status monitoring

**Usage:**
```typescript
import { initializeRealtimeWorker, subscribeToOrganizationEvents } from '@/src/realtime';

// Initialize worker (call once on app startup)
await initializeRealtimeWorker();

// Subscribe to organization events
await subscribeToOrganizationEvents('org123', (event) => {
  console.log('Event received:', event);
});
```

### 3. Connection Manager (`connection-manager.ts`)

Manages active SSE connections and efficiently routes events to connected clients.

**Features:**
- Connection lifecycle tracking
- Organization-based connection indexing
- Event broadcasting to multiple clients
- Stale connection cleanup

### 4. SSE API Endpoint (`app/api/realtime/stream/route.ts`)

**✅ Fully Implemented** - Server-Sent Events endpoint for real-time data streaming to clients.

**Endpoint:** `GET /api/realtime/stream`

**Query Parameters:**
- `organizationId` (required): Organization ID for filtering events
- `channel` (optional): Event channel to subscribe to

**Features:**
- ✅ Authentication via NextAuth
- ✅ Organization membership validation
- ✅ Automatic connection management
- ✅ Heartbeat mechanism (30s intervals)
- ✅ CORS support
- ✅ Graceful disconnection handling

**Example Usage:**
```javascript
const eventSource = new EventSource('/api/realtime/stream?organizationId=org123&channel=property');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received event:', data);
};

eventSource.onerror = (error) => {
  console.error('Connection error:', error);
};
```

### 5. Event Types (`types/realtime.ts`)

Comprehensive TypeScript types for all realtime events and payloads.

**Supported Event Types:**
- `user.activity` - User action tracking
- `property.update` - Property data changes
- `member.join` - New member additions
- `member.leave` - Member departures
- `organization.change` - Organization updates
- `notification.new` - New notifications
- `system.alert` - System-wide alerts
- `data.sync` - Data synchronization events

## Setup Requirements

### Prisma Pulse Setup

To enable actual Prisma Pulse functionality, you need to:

1. **Install Prisma Pulse extension:**
   ```bash
   pnpm add @prisma/extension-pulse
   ```

2. **Configure database for logical replication:**
   - Ensure your PostgreSQL database supports logical replication
   - Enable logical replication in database settings

3. **Update Prisma schema:**
   ```prisma
   generator client {
     provider = "prisma-client-js"
     extensions = [prismaPulse]
   }
   ```

4. **Configure environment variables:**
   ```env
   PULSE_API_KEY=your_pulse_api_key
   PULSE_PROJECT_ID=your_project_id
   ```

### Current Implementation Status

⚠️ **Note:** The current implementation is a **placeholder** that provides the structure and API but doesn't include actual Prisma Pulse functionality. The worker includes placeholder logic that can be replaced with actual Prisma Pulse subscriptions once the setup is complete.

## API Endpoints

### GET /api/realtime/stream
- **Purpose:** Establish SSE connection for real-time events
- **Headers:** Includes CORS support and proper SSE headers
- **Response:** Server-Sent Events stream

### POST /api/realtime/stream
- **Purpose:** Handle WebSocket upgrades and subscription management
- **Status:** Placeholder implementation

### PUT /api/realtime/stream
- **Purpose:** Update subscription settings and filters
- **Status:** Placeholder implementation

### DELETE /api/realtime/stream
- **Purpose:** Close connections and cleanup resources
- **Status:** Placeholder implementation

### OPTIONS /api/realtime/stream
- **Purpose:** Handle CORS preflight requests
- **Response:** CORS headers for cross-origin requests

## Event Flow

1. **Property Model Changes** → Prisma Pulse detects changes
2. **RealtimeWorker** → Processes events and broadcasts to callbacks
3. **SSE API** → Streams events to connected clients
4. **Client Applications** → Receive real-time updates

## Security Considerations

- **Authentication:** ✅ Implemented via NextAuth - All connections require valid session
- **Authorization:** ✅ Organization membership validation - Users can only connect to organizations they belong to
- **Rate Limiting:** TODO - Implement connection limits per user/organization
- **Input Validation:** ✅ Query parameters validated, organization access checked

## Next Steps

1. **Complete Prisma Pulse setup** with actual database configuration
2. ~~**Implement authentication** and authorization for the API~~ ✅ DONE
3. ~~**Add event filtering** based on user permissions and organizationId~~ ✅ DONE
4. ~~**Implement heartbeat mechanism** for connection health~~ ✅ DONE
5. **Add comprehensive error handling** and logging (partially done)
6. **Create client-side integration examples** and React hooks
7. **Add rate limiting** for connections
8. **Implement connection pooling** and optimization

## Testing

To test the SSE endpoint, you need to be authenticated first. Here's how to test:

### Option 1: Browser Console
```javascript
// Open your application in browser (must be logged in)
const eventSource = new EventSource('/api/realtime/stream?organizationId=YOUR_ORG_ID');

eventSource.onopen = () => {
  console.log('Connection opened');
};

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event received:', data);
};

eventSource.onerror = (error) => {
  console.error('Connection error:', error);
};

// Close when done
// eventSource.close();
```

### Option 2: Using curl (with authentication cookie)
```bash
# First, get your session cookie from browser DevTools
curl -N "http://localhost:3000/api/realtime/stream?organizationId=YOUR_ORG_ID" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

The endpoint will return:
1. Initial connection event with organization details
2. Heartbeat comments every 30 seconds
3. Real-time property update events (when configured with Prisma Pulse)

## Troubleshooting

### Common Issues

1. **Prisma Pulse not working:** Ensure database supports logical replication
2. **CORS errors:** Check that the API is properly configured for your domain
3. **Connection drops:** Implement proper error handling and reconnection logic

### Debug Mode

Enable debug logging by setting the worker to log all events:

```typescript
// In worker.ts, uncomment debug logging
console.log('Property event processed:', event);
```
