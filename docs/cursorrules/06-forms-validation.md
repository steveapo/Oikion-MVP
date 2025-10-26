# Forms & Validation Patterns

## Form Library

### React Hook Form
- Version 7.52.1
- Controller-based approach for controlled inputs
- Integration with Zod for schema validation
- useForm hook for form state
- Automatic error handling

### Why React Hook Form
- Minimal re-renders
- Built-in validation
- Easy integration with UI libraries
- TypeScript support
- Server action compatibility

## Form Structure

### Basic Form Setup
- useForm hook with zodResolver
- Define form values type from schema
- defaultValues for initial state
- mode: "onChange" or "onBlur" for validation timing
- Submit handler calls server action

### Form Component Pattern
- Client Component ("use client" required)
- Import form schema from lib/validations
- Setup form with useForm hook
- Map form fields with Controller or register
- Handle submit with server action
- Display validation errors inline

## Zod Schema Validation

### Schema Location
- All schemas in lib/validations/ directory
- One file per entity (property.ts, client.ts, user.ts)
- Export schema and inferred type
- Reuse schemas across client and server

### Schema Definition
- z.object() for object shapes
- Required fields default
- .optional() for optional fields
- .nullable() for null values
- .default() for default values

### Common Validations
- z.string().min(1) for required strings
- z.string().email() for email validation
- z.string().url() for URLs
- z.number().positive() for positive numbers
- z.enum() for enumerated values
- z.date() for dates
- z.array() for arrays

### Custom Validations
- .refine() for custom logic
- Error message as second argument
- Access other fields in context
- Async validation supported
- Complex business rules

### Transform Patterns
- .transform() to modify values
- Trim strings automatically
- Parse numbers from strings
- Format dates
- Normalize data

## Form Fields

### Input Fields
- Use Input component from ui/
- Wrap with FormField and FormControl
- Label with FormLabel
- Error display with FormMessage
- Optional description with FormDescription

### Select Fields
- Use Select component from ui/
- SelectTrigger, SelectContent, SelectItem
- Map over options array
- Handle value changes
- Support for search/filter if many options

### Textarea Fields
- Use Textarea component from ui/
- Auto-resize with react-textarea-autosize
- Character count if limit exists
- Validation for length
- Proper labeling

### Checkbox Fields
- Use Checkbox component from ui/
- Boolean value
- Optional description
- Group for multiple checkboxes
- Indeterminate state support

### Radio Groups
- Use RadioGroup component from ui/
- Mutually exclusive options
- Label each radio
- Visual grouping
- Keyboard navigation

### Date Pickers
- Use date-fns for date manipulation
- Popover with Calendar component
- Format display with format()
- Handle timezone correctly
- Date range support if needed

### File Uploads
- react-dropzone for drag-and-drop
- Image preview before upload
- File type validation
- Size limit validation
- Multiple file support

## Form Validation Patterns

### Client-Side Validation
- Zod schema with zodResolver
- Validates on blur or change
- Immediate feedback
- Prevents invalid submission
- Same schema as server

### Server-Side Validation
- Server action validates with same schema
- Returns validation errors in ActionResult
- Client displays server errors
- Never trust client validation alone
- Security boundary

### Field-Level Errors
- Display errors below field
- Use FormMessage component
- Red text and border on error
- Clear error when corrected
- Focus first error on submit

### Form-Level Errors
- Display at top of form
- General errors (network, server)
- Multiple field errors summary
- Dismissible
- Accessible announcement

## Form Submission

### Server Action Integration
- Define async submit handler
- Call server action with form values
- Wrap in startTransition for pending state
- Handle ActionResult response
- Redirect on success

### Pending States
- useTransition for isPending
- Disable form during submission
- Show loading spinner on submit button
- Disable all inputs
- Prevent double submission

### Optimistic Updates
- Update UI before server response
- Use useOptimistic if available
- Revert on error
- Show pending indicator
- Smooth user experience

### Success Handling
- Toast notification for success
- Redirect to relevant page
- Clear form if creating
- Update UI optimistically
- Close modal if in dialog

### Error Handling
- Display server errors in form
- Map field errors to fields
- General error at form level
- Log unexpected errors
- Allow retry

## Form Reset & Cancel

### Reset Form
- form.reset() to clear form
- Reset to defaultValues
- Clear validation errors
- Reset touched state
- Use after successful submission

### Cancel Action
- Close modal/drawer
- Navigate back
- Confirm if unsaved changes
- Don't persist data
- Clear form state

## Complex Form Patterns

### Multi-Step Forms
- Wizard pattern
- State machine for steps
- Validate per step
- Progress indicator
- Back and next buttons
- Submit on final step

### Dynamic Fields
- useFieldArray for dynamic lists
- Add and remove fields
- Each field properly registered
- Validation per item
- Reorder support if needed

### Dependent Fields
- watch() to observe field values
- Conditional field display
- Validation based on other fields
- Clear dependent fields when parent changes
- Type-safe dependencies

### Nested Objects
- Dot notation for nested fields
- address.street, address.city
- Group in UI
- Validate nested structure
- Flatten if needed for API

## Form Component Examples

### User Auth Form
- Email and password fields
- Show/hide password toggle
- Remember me checkbox
- Forgot password link
- Loading state during submission
- Error display

### Property Form
- Multiple field types
- Image upload
- Rich text editor for description
- Enum selects for status
- Number inputs for price/size
- Location fields

### Client Form
- Contact information
- Relationship type select
- Notes textarea
- Email validation
- Phone number format
- Optional fields marked

## Validation Error Messages

### Clear Messages
- Describe the problem
- Suggest solution if applicable
- Use plain language
- Be specific
- Positive tone

### Internationalization
- Currently English only
- Messages in validation schemas
- Can be extracted for translation
- Consistent terminology
- User-friendly phrasing

## Form Accessibility

### Labels
- Every input has associated label
- Use FormLabel component
- htmlFor attribute matches input id
- Visible labels (not placeholders)
- Clear and descriptive

### Error Announcements
- aria-describedby for error messages
- FormMessage automatically handles
- Live region for form-level errors
- Screen reader friendly
- Error summary option

### Keyboard Navigation
- Logical tab order
- Submit with Enter key
- Cancel with Escape in modals
- Focus management
- Trap focus in modals

### Required Field Indication
- Visual indicator (asterisk)
- aria-required attribute
- Mentioned in label
- Consistent pattern
- Clear in instructions

## Form State Management

### Dirty State
- form.formState.isDirty
- Warn on unsaved changes
- Prompt before navigation
- Highlight changed fields
- Reset on save

### Touched State
- form.formState.touchedFields
- Validate only touched fields
- Better UX than validate all
- Show errors after interaction
- Clear when field changes

### Submit Count
- form.formState.submitCount
- Track submission attempts
- Show validation after first submit
- Different UX for repeat failures
- Help user succeed

## Performance Optimization

### Debouncing
- Debounce expensive validations
- Async validation debounced
- Search field debouncing
- Reduce server requests
- Better UX

### Memoization
- Memo expensive computed values
- useMemo for derived state
- useCallback for handlers
- Prevent unnecessary re-renders
- Measure impact

### Lazy Loading
- Dynamic import heavy editors
- Code split form components
- Load on interaction
- Faster initial load
- Better performance

## File Upload Handling

### Image Upload
- Browser image compression library
- Compress before upload
- Generate preview
- Validate dimensions
- Limit file size (5MB typical)

### Multiple Files
- Map over files array
- Progress indicator per file
- Error handling per file
- Remove individual files
- Upload in parallel or sequence

### Upload Flow
- Select files
- Validate client-side
- Compress if images
- Upload to server/storage
- Save URLs to database
- Display uploaded files

## Form Testing

### Manual Testing
- Happy path with valid data
- Empty required fields
- Invalid formats
- Boundary conditions
- Error recovery
- Keyboard only
- Screen reader

### Validation Testing
- Required field errors
- Format validation (email, URL)
- Range validation (min, max)
- Custom validation rules
- Server validation sync

## Common Pitfalls

### Missing Validation
- Always validate server-side
- Don't trust client validation
- Handle edge cases
- Test thoroughly
- Security implications

### Poor Error Messages
- Vague error text
- Technical jargon
- No guidance for fixing
- Inconsistent messaging
- Not accessible

### Uncontrolled Inputs
- Always use controlled inputs
- React Hook Form manages state
- Avoid direct DOM manipulation
- Two-way binding pattern
- Predictable behavior

### Missing Loading States
- Always show pending state
- Disable during submission
- Prevent double submit
- User feedback essential
- Better perceived performance

## Best Practices Summary

1. Use React Hook Form for all forms
2. Define Zod schemas in lib/validations/
3. Same schema for client and server validation
4. Display errors inline with FormMessage
5. Show pending state during submission
6. Toast notification for success
7. Handle both success and error cases
8. Redirect after successful mutations
9. Reset form after create operations
10. Ensure full accessibility compliance

## Library Versions

React Hook Form: 7.52.1
Zod: 3.23.8
Zodresolver: Via @hookform/resolvers 3.9.0

