# Oikosync Activity Feed Layout Update

## Overview
Updated the Oikosync activity feed to display activities with a **two-line layout**: action title on the first line, dynamic details as a clickable link on the second line. Also translated entity badges and time indicators to Greek.

## Problem Statement
The previous implementation displayed activities in a single line with mixed content:
- Example: "δημιούργησε ακίνητο Διαμέρισμα in a"
- Difficult to scan and read
- Dynamic values (property titles, names) were not prominently displayed
- Entity type badges were in English only
- Time indicators not localized

## Solution

### New Layout Structure
```
┌─────────────────────────────────────────────┐
│ [Icon] Δημιουργήθηκε Ακίνητο      [Badge]  │
│        Διαμέρισμα στην Αθήνα     ←Clickable│
│        από admin@oikion.com • πριν 2 ώρες  │
└─────────────────────────────────────────────┘
```

**Line 1**: Action title (Δημιουργήθηκε Ακίνητο, Ανανεώθηκε Επαφή, etc.)
**Line 2**: Dynamic details as clickable link (property type + location, contact name, task title, etc.)
**Line 3**: Metadata (actor, timestamp with localized "πριν")
**Badge**: Translated entity type (Ακίνητο, Επαφή, Εργασία, etc.)

## Changes Made

### 1. Translation Files

#### `/messages/el/oikosync.json`
Added separate keys for titles and details:

**Activity Titles (Greek passive voice)**:
- `"propertyCreated": "Δημιουργήθηκε Ακίνητο"`
- `"propertyUpdated": "Ανανεώθηκε Ακίνητο"`
- `"propertyArchived": "Αρχειοθετήθηκε Ακίνητο"`
- `"mediaAdded": "Προστέθηκαν Εικόνες"`
- `"clientCreated": "Δημιουργήθηκε Επαφή"`
- `"clientUpdated": "Ανανεώθηκε Επαφή"`
- `"clientRelationshipCreated": "Σύνδεση Επαφών"`
- `"clientRelationshipDeleted": "Διακοπή Σύνδεσης"`
- `"noteAdded": "Προστέθηκε Σημείωση"`
- `"interactionLogged": "Καταγράφηκε Αλληλεπίδραση"`
- `"taskCreated": "Δημιουργήθηκε Εργασία"`
- `"taskCompleted": "Ολοκληρώθηκε Εργασία"`
- `"memberInvited": "Πρόσκληση Μέλους"`
- `"memberRoleChanged": "Αλλαγή Ρόλου"`
- `"subscriptionStarted": "Έναρξη Συνδρομής"`
- `"subscriptionUpdated": "Ανανέωση Συνδρομής"`
- `"subscriptionCancelled": "Ακύρωση Συνδρομής"`

**Activity Details (with variables)**:
- `"propertyCreatedDetails": "{propertyType} {location}"`
- `"clientCreatedDetails": "{clientType} {name}"`
- `"taskCreatedDetails": "{title}"`
- etc.

**Entity Type Badges**:
```json
"entityTypes": {
  "property": "Ακίνητο",
  "client": "Επαφή",
  "task": "Εργασία",
  "interaction": "Αλληλεπίδραση",
  "note": "Σημείωση",
  "member": "Μέλος",
  "subscription": "Συνδρομή"
}
```

**Interaction Types** (capitalized):
```json
"interactionTypes": {
  "call": "Κλήση",
  "email": "Email",
  "meeting": "Συνάντηση",
  "viewing": "Προβολή",
  "interaction": "Αλληλεπίδραση"
}
```

#### `/messages/en/oikosync.json`
Mirrored structure in English:

**Activity Titles**:
- `"propertyCreated": "Property Created"`
- `"clientCreated": "Contact Created"`
- `"taskCompleted": "Task Completed"`
- etc.

**Entity Type Badges**:
- `"property": "Property"`
- `"client": "Contact"`
- `"task": "Task"`
- etc.

### 2. Component Updates

#### `/components/oikosync/activity-feed.tsx`

**Changed return type of `getActivityDisplay`**:
```typescript
// Before
return {
  icon, color, message, linkHref
}

// After
return {
  icon, color, title, details, linkHref
}
```

**Updated JSX layout**:
```tsx
{/* Title */}
<p className="text-sm font-semibold">{title}</p>

{/* Details Link */}
{details && (
  <p className="mt-0.5 text-sm text-muted-foreground">
    {linkHref ? (
      <Link href={linkHref} className="hover:underline">
        {details}
      </Link>
    ) : (
      details
    )}
  </p>
)}
```

**Added entity type badge translation**:
```typescript
const getEntityTypeBadge = () => {
  const typeMap: Record<string, string> = {
    'PROPERTY': t('activities.entityTypes.property'),
    'CLIENT': t('activities.entityTypes.client'),
    // ... etc
  };
  return typeMap[activity.entityType] || activity.entityType.toLowerCase();
};
```

**Updated all activity cases** (15+ types):
- PROPERTY_CREATED, PROPERTY_UPDATED, PROPERTY_ARCHIVED
- MEDIA_ADDED
- CLIENT_CREATED, CLIENT_UPDATED
- CLIENT_RELATIONSHIP_CREATED, CLIENT_RELATIONSHIP_DELETED
- NOTE_ADDED
- INTERACTION_LOGGED
- TASK_CREATED, TASK_COMPLETED
- MEMBER_INVITED, MEMBER_ROLE_CHANGED
- SUBSCRIPTION_STARTED, SUBSCRIPTION_UPDATED, SUBSCRIPTION_CANCELLED

## Examples

### Property Created
**English**:
- Title: "Property Created"
- Details: "Apartment in Athens"
- Badge: "Property"

**Greek**:
- Title: "Δημιουργήθηκε Ακίνητο"
- Details: "Διαμέρισμα στην Αθήνα"
- Badge: "Ακίνητο"

### Contact Updated
**English**:
- Title: "Contact Updated"
- Details: "person John Smith"
- Badge: "Contact"

**Greek**:
- Title: "Ανανεώθηκε Επαφή"
- Details: "άτομο Γιάννης Σμιθ"
- Badge: "Επαφή"

### Task Completed
**English**:
- Title: "Task Completed"
- Details: "Follow up with buyer"
- Badge: "Task"

**Greek**:
- Title: "Ολοκληρώθηκε Εργασία"
- Details: "Παρακολούθηση με αγοραστή"
- Badge: "Εργασία"

## Benefits

1. **Better Scannability**: Consistent action titles make it easy to scan the feed
2. **Clearer Information Hierarchy**: Action → Details → Metadata
3. **Improved Clickability**: Dynamic details are clearly presented as links
4. **Full Localization**: Badges and interaction types properly translated
5. **Professional Greek**: Uses passive voice (Δημιουργήθηκε) for formal tone
6. **Consistent Pattern**: All 15+ activity types follow the same structure

## Grammar Notes

### Greek Passive Voice (used for titles):
- Δημιουργήθηκε (was created)
- Ανανεώθηκε (was updated)
- Αρχειοθετήθηκε (was archived)
- Προστέθηκε/Προστέθηκαν (was/were added)
- Καταγράφηκε (was logged)
- Ολοκληρώθηκε (was completed)

This passive construction is more formal and appropriate for activity logs in Greek.

## Testing

The implementation was tested with the development server running successfully on port 3003.

All TypeScript types are correct, and no runtime errors were encountered.

## Files Modified

1. `/messages/en/oikosync.json` - Added title/details separation + entity type badges
2. `/messages/el/oikosync.json` - Added Greek titles/details + entity type badges
3. `/components/oikosync/activity-feed.tsx` - Refactored to two-line layout with badges

## Future Enhancements

- Add locale-aware date formatting using `date-fns` with Greek locale
- Consider adding activity icons that change based on status (success/error)
- Add filtering by entity type using the translated badge names
- Implement real-time updates with optimistic UI for new activities
