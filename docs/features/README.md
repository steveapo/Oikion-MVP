# Features Documentation

Feature-specific documentation for the Oikion platform. Each major feature has its own subdirectory with detailed guides.

## Available Features

### 👥 Members Management
Member and user management within organizations.

- **[Quickstart: Members](members/quickstart-members.md)** - Quick guide to member management features

**Key Capabilities:**
- Invite new members to organizations
- Manage member roles (ORG_OWNER, ADMIN, AGENT, VIEWER)
- Remove members from organizations
- View member activity and permissions

### 🏢 Personal Workspace
Single-user organization functionality for individual users.

- **[Personal Workspace Guide](personal-workspace.md)** - Personal organization features and protections

**Key Capabilities:**
- Automatic creation of personal workspace on user registration
- Cannot be deleted or modified by the user
- Provides isolated space for individual work
- Protected from accidental deletion

### 📨 Invitations
Token-based invitation system for adding new members to organizations.

**Key Capabilities:**
- Email-based invitations with secure tokens
- Token expiration and validation
- Role assignment during invitation
- Invitation acceptance flow

**Status**: ⚠️ Documentation in progress

## Feature Categories

### MLS (Multiple Listing Service)
Internal property listings management system.

**Status**: ⏳ Documentation pending

### CRM (Customer Relationship Management)
Client and relationship management features.

**Status**: ⏳ Documentation pending

### Socials (Activity Feed)
Organization-wide activity feed and social features.

**Status**: ⏳ Documentation pending

## Common Feature Patterns

### Role-Based Access
All features implement role-based access control:
- `ORG_OWNER` - Full control including deletion
- `ADMIN` - Administrative functions
- `AGENT` - Standard user access
- `VIEWER` - Read-only access

### Organization Isolation
Features are scoped to the current organization:
- Data is filtered by organization automatically
- No cross-organization data access
- Personal workspace is always isolated

### Audit Logging
Key actions are logged for audit purposes:
- Member invitations and acceptances
- Role changes
- Organization modifications
- Data access (where applicable)

## Related Documentation

- [Backend Architecture](../architecture/backend/index.md) - Technical implementation details
- [Database Design](../architecture/backend/database.md) - Data models and relationships
- [Implementation Complete](../implementation/IMPLEMENTATION_COMPLETE.md) - Implementation overview

---

**Last Updated**: October 25, 2025
**Audience**: All Developers, Product Managers
