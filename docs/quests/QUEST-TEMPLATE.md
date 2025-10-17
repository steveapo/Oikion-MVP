# Quest Template

> This template provides a structured format for creating feature quests. Use this to break down complex features into clear, actionable tasks with proper context and success criteria.

## Quest Metadata

**Quest ID**: `QUEST-[YYYYMMDD]-[SHORT-NAME]`  
**Created**: [DATE]  
**Status**: `[PLANNING | IN_PROGRESS | REVIEW | COMPLETE | BLOCKED]`  
**Priority**: `[P0-Critical | P1-High | P2-Medium | P3-Low]`  
**Assigned to**: [Agent/Developer Name]  
**Estimated Effort**: [XS=1-2h | S=2-4h | M=4-8h | L=1-2d | XL=2-5d]

## Quest Summary

**What**: [One-sentence description of what needs to be built]

**Why**: [Business value and user benefit]

**Success Criteria**:
- [ ] [Specific, measurable outcome 1]
- [ ] [Specific, measurable outcome 2]
- [ ] [Specific, measurable outcome 3]

## Context & Background

### Current State
[Describe the current system behavior or lack thereof]

### Desired State
[Describe how the system should behave after this quest is complete]

### User Stories (if applicable)
- **As a** [role], **I want** [feature], **so that** [benefit]
- **As a** [role], **I want** [feature], **so that** [benefit]

## Technical Approach

### Architecture

```
[Architectural diagram or description]

Example:
User → PropertyForm (Client) → createProperty (Server Action) 
  → Validation (Zod) → Database (Prisma + RLS) → Activity Log
```

### Components Involved
- [ ] **Frontend**: [List components to create/modify]
- [ ] **Server Actions**: [List actions to create/modify]
- [ ] **Database**: [List models/migrations needed]
- [ ] **API Routes**: [If any API routes needed]
- [ ] **Types**: [New types or type updates]
- [ ] **Validation**: [Zod schemas needed]

### Data Model Changes

**New Models**:
```prisma
// If adding new Prisma models
model Example {
  id String @id @default(cuid())
  // ...
}
```

**Model Updates**:
```prisma
// If modifying existing models
model Property {
  // Add:
  newField String?
}
```

**Migrations**:
- [ ] Create migration: `pnpm prisma migrate dev --name [migration_name]`
- [ ] Verify RLS policies if adding tenant model
- [ ] Test with existing data

## Implementation Plan

### Phase 1: Foundation
**Goal**: [What should be working after Phase 1]

**Tasks**:
1. [ ] **[Task Name]** (Estimated: [time])
   - Description: [What needs to be done]
   - Files affected: [List files]
   - Dependencies: [Any blockers]
   - Acceptance: [How to verify it works]

2. [ ] **[Task Name]** (Estimated: [time])
   - Description: [What needs to be done]
   - Files affected: [List files]
   - Dependencies: [Any blockers]
   - Acceptance: [How to verify it works]

### Phase 2: Core Logic
**Goal**: [What should be working after Phase 2]

**Tasks**:
1. [ ] **[Task Name]** (Estimated: [time])
   - Description: [What needs to be done]
   - Files affected: [List files]
   - Dependencies: [Any blockers]
   - Acceptance: [How to verify it works]

### Phase 3: Polish & Testing
**Goal**: [What should be working after Phase 3]

**Tasks**:
1. [ ] **[Task Name]** (Estimated: [time])
   - Description: [What needs to be done]
   - Files affected: [List files]
   - Dependencies: [Any blockers]
   - Acceptance: [How to verify it works]

## Rule References

**Relevant rule documents to follow**:
- [ ] [typescript.md](../rules/typescript.md) - For type safety
- [ ] [database.md](../rules/database.md) - For Prisma/RLS patterns
- [ ] [frontend.md](../rules/frontend.md) - For component patterns
- [ ] [api-server-actions.md](../rules/api-server-actions.md) - For server actions
- [ ] [authentication.md](../rules/authentication.md) - For auth/authz
- [ ] [stripe-billing.md](../rules/stripe-billing.md) - For billing features

**Key patterns to apply**:
- Use `prismaForOrg()` for all tenant data
- Server Components by default, 'use client' only when needed
- Validate inputs with Zod
- Check auth/authorization in all server actions
- Use consistent success/error return types

## Testing Strategy

### Unit Tests
```typescript
// Example test structure
describe('[Feature]', () => {
  it('should [expected behavior]', () => {
    // Test logic
  });
});
```

**Test files**:
- [ ] `__tests__/actions/[action-name].test.ts`
- [ ] `__tests__/components/[component-name].test.tsx`
- [ ] `__tests__/lib/[util-name].test.ts`

### Integration Tests
- [ ] Test full user flow: [describe flow]
- [ ] Test with different user roles
- [ ] Test error cases

### Manual Testing Checklist
- [ ] Test as ORG_OWNER (full permissions)
- [ ] Test as ADMIN (limited permissions)
- [ ] Test as AGENT (operational permissions)
- [ ] Test as VIEWER (read-only)
- [ ] Test with invalid inputs
- [ ] Test error states
- [ ] Test loading states
- [ ] Test mobile responsive
- [ ] Test keyboard navigation (a11y)
- [ ] Test with screen reader (if applicable)

## Acceptance Criteria (Definition of Done)

- [ ] All tasks in implementation plan completed
- [ ] Code follows project rules (see Rule References)
- [ ] TypeScript compiles without errors
- [ ] All tests passing
- [ ] Manual testing checklist complete
- [ ] No console errors or warnings
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Database migrations applied and tested
- [ ] RLS policies verified (if tenant data)
- [ ] Documentation updated (if needed)
- [ ] Code reviewed (if team workflow)

## Dependencies & Blockers

**Depends on**:
- [ ] [Other quest or task name] - [Why it's a dependency]

**Blocked by**:
- [ ] [Blocker description] - [Who/what needs to resolve]

**External dependencies**:
- [ ] [API, service, or third-party dependency]

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| [Risk description] | Low/Med/High | Low/Med/High | [How to mitigate] |
| [Risk description] | Low/Med/High | Low/Med/High | [How to mitigate] |

## Notes & Decisions

### Technical Decisions
- **[Decision]**: [Rationale]
- **[Decision]**: [Rationale]

### Open Questions
- [ ] **Q**: [Question]  
  **A**: [Answer or TBD]

### Deferred Items
- **[Item]**: [Why deferred, when to revisit]

## Resources

**Design files**: [Link to Figma, mockups, etc.]  
**Related docs**: [Links to related documentation]  
**Reference implementations**: [Links to similar features or examples]  
**API docs**: [Links to third-party API documentation if applicable]

## Progress Log

**[DATE] - [STATUS]**:
- [Progress note or update]

**[DATE] - [STATUS]**:
- [Progress note or update]

---

## Example Quest (Delete this section when using template)

### Quest: Add Property Image Upload

**Quest ID**: `QUEST-20251017-PROPERTY-IMAGES`  
**Status**: `IN_PROGRESS`  
**Priority**: `P1-High`

**What**: Enable users to upload and manage images for properties

**Why**: Visual representation is critical for property listings

**Success Criteria**:
- [ ] Users can upload multiple images per property
- [ ] Primary image can be designated
- [ ] Images are stored securely and optimized
- [ ] Images display in property detail view

**Implementation Plan**:

**Phase 1: Database Setup**
1. [ ] Verify `MediaAsset` model is correct
2. [ ] Add image upload API route (`/api/upload`)
3. [ ] Test image storage

**Phase 2: Upload UI**
1. [ ] Create `ImageUploader` component (Client)
2. [ ] Add to Property form
3. [ ] Show upload progress

**Phase 3: Display**
1. [ ] Add image gallery to Property detail page
2. [ ] Show primary image in property card
3. [ ] Add image management (delete, set primary)

**Rule References**:
- [frontend.md](../rules/frontend.md) - File upload patterns
- [api-server-actions.md](../rules/api-server-actions.md) - Upload API route
- [database.md](../rules/database.md) - MediaAsset model

---

## Tips for Using This Template

1. **Start simple**: Fill in the basic metadata and summary first
2. **Break it down**: Complex quests should be broken into smaller sub-quests
3. **Be specific**: Vague acceptance criteria lead to scope creep
4. **Link rules**: Always reference relevant rule documents
5. **Track progress**: Update the progress log regularly
6. **Document decisions**: Capture why choices were made
7. **Test thoroughly**: Don't skip the testing checklist
