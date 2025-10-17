/**
 * Toast Message Constants
 * 
 * Standardized toast notification messages for consistent user feedback
 * across all CRUD operations and actions in the Oikion application.
 */

/**
 * Success messages for various operations
 */
export const TOAST_SUCCESS = {
  // Property operations
  PROPERTY_CREATED: "Property created successfully",
  PROPERTY_UPDATED: "Property updated successfully",
  PROPERTY_DELETED: "Property deleted successfully",
  PROPERTY_ARCHIVED: "Property archived successfully",
  PROPERTY_RESTORED: "Property restored successfully",
  
  // Client operations
  CLIENT_CREATED: "Client created successfully",
  CLIENT_UPDATED: "Client updated successfully",
  CLIENT_DELETED: "Client deleted successfully",
  CLIENT_ARCHIVED: "Client archived successfully",
  CLIENT_RESTORED: "Client restored successfully",
  
  // Interaction operations
  INTERACTION_CREATED: "Interaction logged successfully",
  INTERACTION_UPDATED: "Interaction updated successfully",
  INTERACTION_DELETED: "Interaction deleted successfully",
  
  // Note operations
  NOTE_CREATED: "Note added successfully",
  NOTE_UPDATED: "Note updated successfully",
  NOTE_DELETED: "Note deleted successfully",
  
  // Task operations
  TASK_CREATED: "Task created successfully",
  TASK_UPDATED: "Task updated successfully",
  TASK_DELETED: "Task deleted successfully",
  TASK_COMPLETED: "Task marked as complete",
  
  // Member operations
  MEMBER_INVITED: "Invitation sent successfully",
  MEMBER_ROLE_UPDATED: "Member role updated successfully",
  MEMBER_REMOVED: "Member removed successfully",
  
  // Organization operations
  ORGANIZATION_CREATED: "Organization created successfully",
  ORGANIZATION_UPDATED: "Organization settings updated successfully",
  
  // User operations
  USER_NAME_UPDATED: "Name updated successfully",
  USER_EMAIL_UPDATED: "Email updated successfully",
  PASSWORD_CHANGED: "Password changed successfully",
  
  // Media operations
  MEDIA_UPLOADED: "Media uploaded successfully",
  MEDIA_DELETED: "Media deleted successfully",
  PRIMARY_IMAGE_SET: "Primary image updated successfully",
  
  // Relationship operations
  RELATIONSHIP_CREATED: "Relationship created successfully",
  RELATIONSHIP_DELETED: "Relationship removed successfully",
  
  // Generic
  CHANGES_SAVED: "Changes saved successfully",
  SETTINGS_UPDATED: "Settings updated successfully",
} as const;

/**
 * Error messages for various failure scenarios
 */
export const TOAST_ERROR = {
  // Property errors
  PROPERTY_CREATE_FAILED: "Failed to create property. Please try again.",
  PROPERTY_UPDATE_FAILED: "Failed to update property. Please try again.",
  PROPERTY_DELETE_FAILED: "Failed to delete property. Please try again.",
  PROPERTY_ARCHIVE_FAILED: "Failed to archive property. Please try again.",
  PROPERTY_NOT_FOUND: "Property not found or you don't have access.",
  
  // Client errors
  CLIENT_CREATE_FAILED: "Failed to create client. Please try again.",
  CLIENT_UPDATE_FAILED: "Failed to update client. Please try again.",
  CLIENT_DELETE_FAILED: "Failed to delete client. Please try again.",
  CLIENT_ARCHIVE_FAILED: "Failed to archive client. Please try again.",
  CLIENT_NOT_FOUND: "Client not found or you don't have access.",
  
  // Interaction errors
  INTERACTION_CREATE_FAILED: "Failed to log interaction. Please try again.",
  INTERACTION_UPDATE_FAILED: "Failed to update interaction. Please try again.",
  INTERACTION_DELETE_FAILED: "Failed to delete interaction. Please try again.",
  
  // Note errors
  NOTE_CREATE_FAILED: "Failed to add note. Please try again.",
  NOTE_UPDATE_FAILED: "Failed to update note. Please try again.",
  NOTE_DELETE_FAILED: "Failed to delete note. Please try again.",
  
  // Task errors
  TASK_CREATE_FAILED: "Failed to create task. Please try again.",
  TASK_UPDATE_FAILED: "Failed to update task. Please try again.",
  TASK_DELETE_FAILED: "Failed to delete task. Please try again.",
  
  // Member errors
  MEMBER_INVITE_FAILED: "Failed to send invitation. Please try again.",
  MEMBER_ROLE_UPDATE_FAILED: "Failed to update member role. Please try again.",
  MEMBER_REMOVE_FAILED: "Failed to remove member. Please try again.",
  INVALID_EMAIL: "Please provide a valid email address.",
  
  // Organization errors
  ORGANIZATION_CREATE_FAILED: "Failed to create organization. Please try again.",
  ORGANIZATION_UPDATE_FAILED: "Failed to update organization. Please try again.",
  
  // User errors
  USER_NAME_UPDATE_FAILED: "Failed to update name. Please try again.",
  USER_EMAIL_UPDATE_FAILED: "Failed to update email. Please try again.",
  PASSWORD_CHANGE_FAILED: "Failed to change password. Please try again.",
  INVALID_PASSWORD: "Current password is incorrect.",
  
  // Media errors
  MEDIA_UPLOAD_FAILED: "Failed to upload media. Please try again.",
  MEDIA_DELETE_FAILED: "Failed to delete media. Please try again.",
  FILE_TOO_LARGE: "File size exceeds maximum limit.",
  INVALID_FILE_TYPE: "Invalid file type. Please upload an image.",
  
  // Relationship errors
  RELATIONSHIP_CREATE_FAILED: "Failed to create relationship. Please try again.",
  RELATIONSHIP_DELETE_FAILED: "Failed to remove relationship. Please try again.",
  RELATIONSHIP_EXISTS: "This relationship already exists.",
  
  // Validation errors
  VALIDATION_FAILED: "Please check the form for errors.",
  REQUIRED_FIELDS_MISSING: "Please fill in all required fields.",
  
  // Permission errors
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  INSUFFICIENT_PERMISSIONS: "You don't have permission to perform this action.",
  
  // Network & server errors
  NETWORK_ERROR: "Connection lost. Check your internet connection.",
  SERVER_ERROR: "Something went wrong. Please try again.",
  TIMEOUT: "Request timed out. Please try again.",
  RATE_LIMIT: "Too many requests. Please wait a moment and try again.",
  
  // Generic
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  CHANGES_NOT_SAVED: "Failed to save changes. Please try again.",
} as const;

/**
 * Info messages for user guidance
 */
export const TOAST_INFO = {
  NO_CHANGES: "No changes were made.",
  CHANGES_DISCARDED: "Changes discarded.",
  LOADING: "Loading...",
  PROCESSING: "Processing your request...",
  RETRYING: "Retrying...",
  SYNCING: "Syncing data...",
} as const;

/**
 * Warning messages
 */
export const TOAST_WARNING = {
  UNSAVED_CHANGES: "You have unsaved changes.",
  CONFIRM_DELETE: "Are you sure you want to delete this?",
  CONFIRM_ARCHIVE: "Are you sure you want to archive this?",
  CONFIRM_REMOVE: "Are you sure you want to remove this?",
  SESSION_EXPIRING: "Your session is about to expire.",
  SUBSCRIPTION_EXPIRING: "Your subscription is expiring soon.",
  TRIAL_ENDING: "Your trial is ending soon.",
} as const;

/**
 * Helper type for all toast message types
 */
export type ToastMessage = 
  | typeof TOAST_SUCCESS[keyof typeof TOAST_SUCCESS]
  | typeof TOAST_ERROR[keyof typeof TOAST_ERROR]
  | typeof TOAST_INFO[keyof typeof TOAST_INFO]
  | typeof TOAST_WARNING[keyof typeof TOAST_WARNING];

/**
 * Get custom success message with dynamic content
 */
export function getSuccessMessage(template: string, ...values: string[]): string {
  return values.reduce((msg, val, idx) => msg.replace(`{${idx}}`, val), template);
}

/**
 * Get custom error message with dynamic content
 */
export function getErrorMessage(template: string, ...values: string[]): string {
  return values.reduce((msg, val, idx) => msg.replace(`{${idx}}`, val), template);
}

/**
 * Toast duration constants (in milliseconds)
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  DEFAULT: 3000,
  LONG: 5000,
  PERSISTENT: Infinity,
} as const;

/**
 * Get appropriate toast duration based on message type
 */
export function getToastDuration(isError: boolean = false): number {
  return isError ? TOAST_DURATION.LONG : TOAST_DURATION.DEFAULT;
}
