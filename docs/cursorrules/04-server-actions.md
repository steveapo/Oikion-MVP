# Server Actions Patterns & Conventions

## Server Action Fundamentals

### Action Declaration
- Add "use server" directive at top of file
- Must be async functions
- Exported from actions/ directory files
- Never throw errors, return ActionResult<T>
- Type-safe with Zod validation

### File Organization
- One file per entity (properties.ts, clients.ts, members.ts)
- Grouped in actions/ directory at root
- Related actions together
- Clear naming for intent
- Reusable helper functions

## SafeAction Wrapper Pattern

### Using safeAction
- All mutations use safeAction wrapper from lib/actions/safe-action.ts
- Provides automatic authentication check
- Organization context extraction
- Role-based permission checking
- Standard error handling

### Action Handler Structure
- Receives validated input and ActionContext
- Context includes: userId, organizationId, userRole, prisma
- Return data directly (wrapper handles ActionResult)
- Throw ActionError for business logic failures
- Use context.prisma for scoped queries

### Permission Checking
- minimumRole option for role requirement
- Custom requirePermission function for complex checks
- canCreateContent, canDeleteContent helpers
- Fail early with clear error messages
- Document permission requirements

## ActionResult Pattern

### Success Response
- { success: true, data: T }
- data contains the result payload
- Type-safe with generic parameter
- Consistent structure across app
- Easy client-side handling

### Error Response
- { success: false, error: string, code: ActionErrorCode }
- error is user-friendly message
- code for programmatic handling
- Optional fieldErrors for validation
- Logged server-side for debugging

### Error Codes
- UNAUTHORIZED: Not authenticated
- FORBIDDEN: Insufficient permissions
- VALIDATION_ERROR: Input validation failed
- NOT_FOUND: Resource doesn't exist
- INTERNAL_ERROR: Unexpected server error
- ORG_REQUIRED: Organization context missing

## Input Validation

### Zod Schema Integration
- Define schemas in lib/validations/
- Pass schema to safeAction
- Automatic validation before handler
- Type inference from schema
- Field-level error messages

### Validation Patterns
- Required fields with no default
- Optional with .optional()
- Transform with .transform()
- Custom validation with .refine()
- Consistent error messages

## Data Mutations

### Create Operations
- Validate input with create schema
- Check permissions (minimumRole or custom)
- Use prismaForOrg for scoped create
- Create activity log after success
- Revalidate appropriate caches
- Return created entity

### Update Operations
- Find existing record first
- Verify ownership/permissions
- Use partial schemas for updates
- Update with validated data
- Log activity with changes
- Revalidate affected caches
- Return updated entity

### Delete Operations
- Verify record exists
- Check delete permissions
- Consider soft delete vs hard delete
- Handle cascade deletes
- Log deletion activity
- Revalidate caches
- Optionally return deleted entity

## Activity Logging

### When to Log
- All create, update, delete operations
- Important state changes
- Permission grants/revokes
- Never log reads (too noisy)
- Failed mutations logged separately

### Activity Log Structure
- actionType: CREATED, UPDATED, DELETED, etc.
- entityType: PROPERTY, CLIENT, TASK, etc.
- entityId: ID of affected resource
- actorId: User who performed action
- organizationId: Context of action
- payload: Optional metadata (changes, old values)

### Error Handling
- Activity logging failures shouldn't break mutation
- Log error but continue
- Mutations succeed even if activity fails
- Monitor activity creation errors
- Consider async activity logging

## Cache Invalidation

### Revalidation Strategy
- revalidateTag for surgical invalidation
- Tags by entity type (properties, clients, members)
- Multiple tags for related data
- Revalidate after successful mutation
- Path revalidation as fallback

### Tag Naming Convention
- Entity plural: properties, clients, tasks
- Specific: property-123, client-456
- List tags: properties-list, recent-properties
- Related: client-123-interactions
- Consistent across application

### When to Revalidate
- After every create operation
- After every update operation
- After every delete operation
- After bulk operations
- After import/export operations

## Form Integration

### Server Action in Forms
- Use action prop on form element
- FormData passed automatically
- Progressive enhancement works
- No JavaScript required
- Handle in action handler

### useTransition Pattern
- Wrap action call in startTransition
- Pending state while action runs
- Optimistic updates possible
- Error handling in catch
- Success feedback in then

### Form Validation
- Client-side with Zod schema
- Server-side validation enforced
- Display field errors
- Focus first error field
- Success toast notification

## Error Handling Patterns

### Try-Catch in Actions
- Wrap database operations
- Catch known Prisma errors
- Map to ActionErrorCode
- Return ActionError result
- Log unexpected errors

### User-Friendly Messages
- Generic message for unexpected errors
- Specific messages for known failures
- No technical details to user
- Log full error server-side
- Guide user to resolution

### Validation Errors
- Field-specific error messages
- Return fieldErrors object
- Display inline in form
- Highlight error fields
- Clear on correction

## Permission Patterns

### Role-Based Checks
- minimumRole: 'AGENT' for basic operations
- minimumRole: 'ADMIN' for management
- minimumRole: 'ORG_OWNER' for org settings
- Checked before action logic
- Automatic forbidden error

### Resource Ownership
- Check createdBy matches userId
- Organization membership verified
- Shared resources require explicit permission
- Fail with FORBIDDEN error code
- Document ownership rules

### Custom Permission Logic
- requirePermission function for complex checks
- Throw ActionError if check fails
- Example: can assign tasks to team members
- Example: can view archived properties
- Domain-specific rules

## Optimistic Updates

### Pattern
- Update UI immediately
- Call server action
- Revert on failure
- Confirm on success
- Show pending state

### When to Use
- Frequent operations (toggles, likes)
- Operations unlikely to fail
- Immediate feedback needed
- Network latency noticeable
- User expects instant response

### Implementation
- Local state for optimistic value
- Revert state on error
- Match server response shape
- Handle race conditions
- Sync with server truth

## Batch Operations

### Bulk Actions
- Accept array of IDs
- Process in transaction
- All or nothing semantics
- Return summary results
- Activity log for batch

### Performance Considerations
- Limit batch size
- Use createMany for inserts
- Single transaction for consistency
- Parallel processing where safe
- Progress indication for large batches

## Redirects After Actions

### When to Redirect
- After successful create (to detail page)
- After successful delete (to list page)
- After profile update (to dashboard)
- Use redirect() from next/navigation
- Only redirect on success

### Redirect Patterns
- Create property → /dashboard/properties/[id]
- Delete property → /dashboard/properties
- Update settings → /dashboard/settings (stay)
- Provide feedback before redirect
- Use toast for success message

## Loading & Pending States

### useFormStatus Hook
- In child component of form
- Provides pending state
- Disable submit during action
- Show loading indicator
- Used in form buttons

### Custom Pending States
- useTransition for non-form actions
- isPending boolean
- Disable controls during action
- Show spinner or skeleton
- Re-enable on complete/error

## Testing Considerations

### Manual Testing
- Test happy path
- Test validation errors
- Test permission denials
- Test not found scenarios
- Test concurrent actions

### Error Scenarios
- Network failures
- Database connection loss
- Unique constraint violations
- Foreign key violations
- Timeout errors

## Common Action Patterns

### CRUD Actions
- createEntity(input)
- updateEntity(id, input)
- deleteEntity(id)
- getEntity(id) - if needed server-side
- listEntities(filters) - prefer direct query

### State Transitions
- archiveProperty(id)
- publishProperty(id)
- assignTask(taskId, userId)
- acceptInvitation(token)
- clearState actions

### Bulk Operations
- deleteMultipleProperties(ids[])
- archiveMultipleClients(ids[])
- updatePropertyStatuses(ids[], status)
- batchOperations with transaction

## Security Best Practices

1. Always validate input with Zod schemas
2. Check authentication before any operation
3. Verify organization context for multi-tenant data
4. Check permissions before mutations
5. Never trust client-provided IDs without verification
6. Sanitize user input
7. Log security-relevant actions
8. Rate limit expensive operations
9. Prevent CSRF with Auth.js tokens
10. Return minimal data to client

## Performance Optimization

### Database Efficiency
- Use select to limit fields
- Batch queries where possible
- Use transactions for multiple operations
- Index frequently filtered fields
- Monitor slow queries

### Caching Strategy
- Cache expensive reads
- Tag caches for invalidation
- Invalidate surgically, not broadly
- Balance freshness and performance
- Use unstable_cache for reads

### Response Size
- Return only necessary data
- Paginate large result sets
- Compress responses automatically
- Avoid returning full objects
- Stream large responses

## Common Pitfalls

### Serialization Errors
- Return serializable data only
- No functions, class instances, undefined
- Dates become strings
- Use JSON-compatible types
- Document serialization constraints

### Race Conditions
- Use database transactions
- Optimistic locking for critical updates
- Idempotent operations where possible
- Handle concurrent modifications
- Retry transient failures

### Memory Leaks
- Clean up resources
- Close database connections properly
- Avoid large in-memory buffers
- Stream large datasets
- Monitor memory usage

## Debugging Actions

### Logging
- Log action entry with input
- Log permission checks
- Log database operations
- Log errors with context
- Structured logging format

### Error Tracking
- Monitor ActionError occurrences
- Track error codes frequency
- Alert on unexpected errors
- Correlate errors with user actions
- Aggregate errors for trends

## Best Practices Summary

1. Use safeAction wrapper for all mutations
2. Return ActionResult<T> consistently
3. Validate input with Zod schemas
4. Check permissions before mutations
5. Use prismaForOrg for organization scoping
6. Log activities for audit trail
7. Revalidate caches after mutations
8. Return user-friendly error messages
9. Never throw, always return error result
10. Document permissions and side effects

## Server Actions Version

Next.js: 14.2.5 (stable)
Pattern: Established in project
Updates: Follow Next.js releases

