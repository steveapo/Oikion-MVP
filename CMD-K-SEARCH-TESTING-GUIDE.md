# CMD+K Search - Manual Testing Guide

## Quick Testing Checklist

### 1. Basic Functionality
- [ ] Press CMD+K (Mac) or CTRL+K (Windows) to open search
- [ ] Type less than 2 characters → no search triggered
- [ ] Type 2+ characters → search executes after 300ms
- [ ] Results appear grouped by Properties, Clients, Navigation
- [ ] ESC key closes the dialog
- [ ] Click outside dialog closes it

### 2. Property Search
**Test Query: "athens"**
- [ ] Should return properties with:
  - City = "Athens"
  - Region containing "athens"
  - Location text containing "athens"
- [ ] Should NOT return archived properties
- [ ] Result format: "{PropertyType} in {City}"
- [ ] Subtitle shows: "€{Price} • {Bedrooms} bed • {City}, {Region}"
- [ ] Clicking result navigates to `/dashboard/properties/{id}`

**Test Query: "apartment"**
- [ ] May not return results (property type not searchable in current implementation)

### 3. Client Search
**Test Query: "john"**
- [ ] Should return clients with:
  - Name containing "john"
  - Email containing "john"
  - Phone containing "john"
- [ ] Result format: "{Name}"
- [ ] Subtitle shows: "{ClientType} • {Email} • {Phone}"
- [ ] Clicking result navigates to `/dashboard/relations/{id}`

**Test Query: "@example.com"**
- [ ] Should return clients with emails containing "@example.com"

### 4. Navigation Links
- [ ] Should always appear in search results
- [ ] Clicking navigates to correct route
- [ ] Icons display correctly

### 5. Edge Cases
**Empty Query:**
- [ ] Placeholder text shows
- [ ] No results displayed
- [ ] No error message

**No Results:**
- [ ] Shows "No results found. Try different keywords."
- [ ] No crash or console errors

**Very Long Query (200+ chars):**
- [ ] Should show validation error
- [ ] Or handle gracefully

### 6. Performance
- [ ] Search completes in <1 second
- [ ] No lag when typing rapidly
- [ ] Debounce prevents excessive server calls (check Network tab)

### 7. Accessibility
**Keyboard Navigation:**
- [ ] CMD+K opens dialog and focuses input
- [ ] Arrow Down moves to first result
- [ ] Arrow Up/Down navigate through results
- [ ] Enter selects highlighted result
- [ ] ESC closes dialog

**Screen Reader (if available):**
- [ ] Dialog announces "Search properties, clients, and pages"
- [ ] Input has descriptive label
- [ ] Instructions are read by screen reader
- [ ] Result count announced on change

### 8. Role-Based Access
**As ORG_OWNER:**
- [ ] Can search all organization properties
- [ ] Can search all organization clients
- [ ] Can navigate to all results

**As ADMIN:**
- [ ] Same as ORG_OWNER

**As AGENT:**
- [ ] Same as ORG_OWNER (read access for all)

**As VIEWER:**
- [ ] Same as ORG_OWNER (read access for all)

**Unauthenticated:**
- [ ] Search should not be accessible
- [ ] Redirect to login if attempted

### 9. Cross-Tenant Isolation
**Setup:** Create properties in two different organizations
**Test:**
- [ ] Log in as user from Organization A
- [ ] Search for property from Organization B
- [ ] Verify it does NOT appear in results
- [ ] Switch to Organization B user
- [ ] Verify Organization B property DOES appear

### 10. Error Handling
**Simulate Network Error:**
- [ ] Disconnect internet
- [ ] Attempt search
- [ ] Should show "Search failed. Check your connection."
- [ ] Reconnect and retry → works

**Server Error:**
- [ ] Should show "Search unavailable. Please try again."
- [ ] Should not crash or freeze UI

---

## Test Data Setup

### Create Test Properties
```sql
-- Property in Athens
INSERT INTO Property (...) VALUES ('APARTMENT', 'Athens', ...);

-- Property in Thessaloniki
INSERT INTO Property (...) VALUES ('HOUSE', 'Thessaloniki', ...);

-- Archived property (should not appear)
INSERT INTO Property (...) VALUES ('VILLA', 'Athens', ...);
UPDATE Listing SET marketingStatus = 'ARCHIVED' WHERE propertyId = ...;
```

### Create Test Clients
```sql
-- Client with name "John Doe"
INSERT INTO Client (...) VALUES ('John Doe', 'john@example.com', ...);

-- Client with phone only
INSERT INTO Client (...) VALUES ('Maria Smith', NULL, '+30 210 123 4567');
```

---

## Browser Testing

### Supported Browsers
- [ ] Chrome 90+ (CMD+K works)
- [ ] Firefox 88+ (CTRL+K works)
- [ ] Safari 14+ (CMD+K works)
- [ ] Edge 90+ (CTRL+K works)

---

## Performance Benchmarks

**Query Response Time:**
- Target: <500ms
- Acceptable: <1000ms
- Poor: >1000ms

**Debounce Effectiveness:**
- Type "athens" rapidly (5 chars/sec)
- Expected: 1-2 server calls
- Actual: _____ calls

**Result Rendering:**
- 10 properties + 10 clients
- Expected: Instant render (<100ms)
- Actual: _____ ms

---

## Known Issues (To Monitor)

1. **Property Type Search:** Currently does not search by property type (e.g., "apartment" won't match PropertyType.APARTMENT)
   - Workaround: Search by city/region instead
   - Fix: Add property type to search fields in future iteration

2. **Phone Number Formatting:** Searches exact phone string, not normalized
   - Example: "+30 210 123 4567" != "2101234567"
   - Workaround: Users must type phone as stored
   - Fix: Add phone normalization in future iteration

3. **Accent Sensitivity:** May not match Greek characters with accents
   - Example: "Αθήνα" vs "Αθηνα"
   - Workaround: Use unaccented characters
   - Fix: Add accent-insensitive search collation

---

## Reporting Issues

When reporting issues, include:
1. Search query used
2. Expected results
3. Actual results
4. User role
5. Organization ID
6. Browser & version
7. Console errors (if any)
8. Network tab screenshot (if performance issue)

---

## Next Steps After Testing

1. ✅ Functional testing passes → Deploy to staging
2. ✅ Accessibility testing passes → Document compliance
3. ✅ Performance testing passes → Deploy to production
4. ❌ Issues found → Log bugs and prioritize fixes
5. ⏳ User feedback → Plan iteration 2 enhancements

---

**Testing Status:** ⏳ Pending Manual Testing  
**Last Updated:** 2025-10-18
