# Realtime Layer Documentation

## Directory Structure

```
src/realtime/
├── index.md                 # This documentation file
├── worker.ts               # Subscriber worker for real-time event processing
├── api/
│   └── stream/
│       └── route.ts        # API route for live events streaming
└── types/
    └── realtime.ts         # TypeScript types for event payloads and structures
```

## Overview

The realtime layer provides real-time event streaming and processing capabilities for the Oikion application. It consists of three main components:

### 1. Worker (`worker.ts`)
- **Purpose**: Background service for handling real-time event subscriptions
- **Responsibilities**:
  - WebSocket/SSE connection management
  - Subscription lifecycle (subscribe/unsubscribe)
  - Event processing and business logic application
  - Connection failure handling and reconnection
  - Event filtering and routing

### 2. API Route (`api/stream/route.ts`)
- **Purpose**: HTTP endpoints for real-time event streaming
- **Endpoints**:
  - `GET /api/stream` - Server-Sent Events for real-time data streaming
  - `POST /api/stream` - WebSocket upgrades and subscription management
  - `PUT /api/stream` - Subscription updates and filter modifications
  - `DELETE /api/stream` - Connection cleanup and resource management

### 3. Types (`types/realtime.ts`)
- **Purpose**: TypeScript type definitions for the realtime system
- **Includes**:
  - Event payload structures for different event types
  - Subscription and connection management types
  - Error handling and status types
  - Channel and routing types
  - Authentication and authorization types

## Event Types Supported

- `user.activity` - User action tracking
- `property.update` - Property data changes
- `member.join` - New member additions
- `member.leave` - Member departures
- `organization.change` - Organization updates
- `notification.new` - New notifications
- `system.alert` - System-wide alerts
- `data.sync` - Data synchronization events

## Event Channels

- `user` - User-specific events
- `property` - Property-related events
- `organization` - Organization-wide events
- `system` - System-level events
- `notifications` - Notification events

## Integration Points

- **Authentication**: Integrates with application auth system
- **State Management**: Updates application state through callbacks
- **Database**: Event persistence and retrieval
- **API Routes**: Next.js API route handlers
- **Frontend**: Real-time UI updates

## Implementation Status

⚠️ **Note**: All files are currently stub implementations with detailed documentation and TODO comments. Business logic implementation is pending.

## Next Steps

1. Implement WebSocket/SSE connection management in `worker.ts`
2. Add authentication and authorization to API routes
3. Implement event processing pipeline
4. Add error handling and reconnection logic
5. Integrate with application state management
6. Add comprehensive testing

## Version History

- **v1.0.0** - Initial stub implementation with documentation
