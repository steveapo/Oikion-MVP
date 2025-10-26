# Realtime Layer Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  EventSource('/api/realtime/stream?organizationId=xxx')    │    │
│  └────────────────────────┬───────────────────────────────────┘    │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                             │ SSE Connection
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTE                                 │
│                 (app/api/realtime/stream/route.ts)                   │
│                                                                       │
│  1. Authenticate via NextAuth                                        │
│  2. Verify organization membership                                   │
│  3. Create SSE stream                                                │
│  4. Register with ConnectionManager                                  │
│  5. Subscribe to organization events                                 │
└────────────────────────┬────────────┬────────────────────────────────┘
                         │            │
        ┌────────────────┘            └────────────────┐
        │                                              │
        ▼                                              ▼
┌──────────────────────┐                    ┌──────────────────────┐
│ ConnectionManager    │                    │  RealtimeWorker      │
│                      │                    │   (Singleton)        │
│ • Track connections  │                    │                      │
│ • Organize by org    │◄───────events─────│ • Prisma Pulse       │
│ • Broadcast events   │                    │ • Event filtering    │
│ • Cleanup stale      │                    │ • Reconnection       │
└──────────────────────┘                    └──────┬───────────────┘
                                                   │
                                                   │ Database changes
                                                   ▼
                                          ┌─────────────────┐
                                          │   PostgreSQL    │
                                          │   (via Neon)    │
                                          │                 │
                                          │ • Properties    │
                                          │ • Clients       │
                                          │ • Activities    │
                                          └─────────────────┘
```

## Component Responsibilities

### 1. **Client (Browser)**
- Establishes EventSource connection
- Receives real-time updates
- Handles reconnection on errors
- Parses incoming events

### 2. **API Route** (`app/api/realtime/stream/route.ts`)
**Responsibilities:**
- Authentication & authorization
- SSE stream creation
- Connection lifecycle management
- Heartbeat mechanism

**Security:**
- ✅ Session validation
- ✅ Organization membership check
- ✅ CORS handling
- ✅ Input validation

### 3. **ConnectionManager** (`src/realtime/connection-manager.ts`)
**Responsibilities:**
- Track active SSE connections
- Index connections by organization
- Broadcast events efficiently
- Clean up stale connections

**Data Structures:**
```typescript
connections: Map<connectionId, Connection>
connectionsByOrg: Map<organizationId, Set<connectionId>>
```

### 4. **RealtimeWorker** (`src/realtime/worker.ts`)
**Responsibilities:**
- Subscribe to database changes (Prisma Pulse)
- Process and transform events
- Filter events by organization
- Broadcast to registered callbacks

**Event Flow:**
```
Database Change → Prisma Pulse → Worker → Filter → Broadcast
```

### 5. **Instance Manager** (`src/realtime/instance.ts`)
**Responsibilities:**
- Singleton pattern implementation
- Worker lifecycle management
- Organization-based subscription helpers
- Status monitoring

## Event Flow

### Property Update Example

```
1. User updates property in UI
   ↓
2. API route saves to database
   ↓
3. Prisma Pulse detects change
   ↓
4. RealtimeWorker receives event
   ↓
5. Worker filters by organizationId
   ↓
6. ConnectionManager broadcasts to org connections
   ↓
7. SSE streams event to all connected clients
   ↓
8. Clients receive and update UI
```

## Authentication Flow

```
Client Request
   ↓
Next.js Middleware (if applicable)
   ↓
API Route Handler
   ↓
auth() from @/auth
   ↓
Check session.user.id
   ↓
Query OrganizationMember
   ↓
Verify user belongs to organizationId
   ↓
   ├─ Yes → Establish SSE connection
   └─ No  → Return 403 Forbidden
```

## Connection Lifecycle

```
┌─────────────┐
│   CREATED   │
└──────┬──────┘
       │
       │ connectionManager.addConnection()
       ▼
┌─────────────┐
│   ACTIVE    │◄──── Heartbeat every 30s
└──────┬──────┘
       │
       │ Events streamed
       │
       ▼
┌─────────────┐
│ DISCONNECTED│
└──────┬──────┘
       │
       │ connectionManager.removeConnection()
       ▼
┌─────────────┐
│   CLEANUP   │
└─────────────┘
```

## Data Structures

### Connection Object
```typescript
{
  id: string;                              // Unique connection ID
  controller: ReadableStreamDefaultController;  // SSE stream controller
  userId: string;                          // Authenticated user
  organizationId: string;                  // Organization scope
  channel?: string;                        // Optional event channel filter
  connectedAt: number;                     // Connection timestamp
  lastActivity: number;                    // Last heartbeat/event
}
```

### Event Object
```typescript
{
  id: string;                              // Unique event ID
  type: EventType;                         // Event type enum
  timestamp: number;                       // Event timestamp
  source: string;                          // Event source (e.g., 'prisma-pulse')
  version: string;                         // Event schema version
  payload: {                               // Event-specific data
    organizationId: string;                // For filtering
    // ... other fields
  }
}
```

## Scalability Considerations

### Current Implementation
- ✅ In-memory connection tracking
- ✅ Organization-based indexing
- ✅ Efficient Map data structures
- ✅ Single worker instance per server

### Horizontal Scaling (Future)
For multiple server instances, consider:
1. **Redis Pub/Sub** for cross-server event distribution
2. **Sticky sessions** to route users to same server
3. **Shared connection registry** in Redis
4. **WebSocket fallback** for better load balancing

### Vertical Scaling
Current implementation can handle:
- ~10,000 concurrent connections per server
- Limited by Node.js EventLoop capacity
- Memory usage: ~1KB per connection

## Error Handling

### Connection Errors
```
Error Detected
   ↓
Log error
   ↓
Remove from ConnectionManager
   ↓
Client EventSource auto-reconnects
   ↓
New connection established
```

### Worker Errors
```
Error in Prisma Pulse
   ↓
Log error
   ↓
Attempt reconnection (with backoff)
   ↓
   ├─ Success → Resume normal operation
   └─ Failure → Retry up to 5 times
```

## Performance Optimizations

1. **Connection Indexing**: O(1) lookup by organization
2. **Event Filtering**: Early filtering at worker level
3. **Batch Broadcasting**: Single loop per organization
4. **Heartbeat Efficiency**: Comment-based heartbeat (minimal data)
5. **Lazy Initialization**: Worker starts only when needed

## Monitoring Points

Key metrics to monitor:
- **Active connections** per organization
- **Event throughput** (events/second)
- **Broadcast latency** (time from event to client)
- **Connection churn** (connects/disconnects per minute)
- **Failed broadcasts** (broken connections)

## Security Layers

```
Layer 1: Authentication (NextAuth)
   ↓
Layer 2: Organization Membership (Prisma query)
   ↓
Layer 3: Event Filtering (organizationId match)
   ↓
Layer 4: CORS (origin validation)
```

## Integration with Oikion App

### Uses Existing Infrastructure
- ✅ `@/auth` - NextAuth session
- ✅ `@/lib/db` - Prisma client
- ✅ `OrganizationMember` model
- ✅ Next.js App Router patterns

### Consistent with App Patterns
- ✅ Organization-first architecture
- ✅ Role-based access control ready
- ✅ Similar to existing API routes
- ✅ TypeScript throughout
