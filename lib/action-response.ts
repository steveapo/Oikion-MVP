/**
 * Standardized Action Response Types
 * 
 * This module provides a consistent structure for server action responses
 * across the Oikion application. All server actions should return these types
 * for predictable error handling and user feedback.
 */

/**
 * Error codes for machine-readable error classification
 */
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  
  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  
  // Resource Errors
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  CONFLICT = "CONFLICT",
  
  // Server Errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  
  // Network & Rate Limiting
  NETWORK_ERROR = "NETWORK_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  TIMEOUT = "TIMEOUT",
}

/**
 * Field-level validation error structure
 */
export type ValidationErrors = Record<string, string | string[]>;

/**
 * Base structure for all action responses
 */
export interface BaseActionResponse {
  success: boolean;
}

/**
 * Success response structure
 */
export interface SuccessResponse<T = void> extends BaseActionResponse {
  success: true;
  data?: T;
}

/**
 * Error response structure with detailed information
 */
export interface ErrorResponse extends BaseActionResponse {
  success: false;
  
  /** User-friendly error message suitable for display */
  error: string;
  
  /** Machine-readable error code for programmatic handling */
  errorCode: ErrorCode;
  
  /** Field-level validation errors (for form validation) */
  validationErrors?: ValidationErrors;
  
  /** Whether the operation can be safely retried */
  isRetryable: boolean;
  
  /** Optional error tracking ID for support/debugging */
  supportId?: string;
  
  /** Optional additional context (not shown to user) */
  details?: Record<string, unknown>;
}

/**
 * Union type for all action responses
 */
export type ActionResponse<T = void> = SuccessResponse<T> | ErrorResponse;

/**
 * User-friendly error messages for each error code
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: "Your session has expired. Please sign in again.",
  [ErrorCode.SESSION_EXPIRED]: "Your session has expired. Please sign in again.",
  [ErrorCode.FORBIDDEN]: "You don't have permission to perform this action.",
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: "You don't have permission to perform this action.",
  
  [ErrorCode.VALIDATION_ERROR]: "Please check the form for errors.",
  [ErrorCode.INVALID_INPUT]: "The provided information is invalid. Please check and try again.",
  
  [ErrorCode.NOT_FOUND]: "The resource you're looking for doesn't exist.",
  [ErrorCode.ALREADY_EXISTS]: "This resource already exists.",
  [ErrorCode.CONFLICT]: "This action conflicts with existing data.",
  
  [ErrorCode.INTERNAL_ERROR]: "Something went wrong. Please try again.",
  [ErrorCode.DATABASE_ERROR]: "A database error occurred. Please try again.",
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: "An external service is unavailable. Please try again later.",
  
  [ErrorCode.NETWORK_ERROR]: "Connection lost. Check your internet connection.",
  [ErrorCode.RATE_LIMIT_EXCEEDED]: "Too many requests. Please wait a moment and try again.",
  [ErrorCode.TIMEOUT]: "The request timed out. Please try again.",
};

/**
 * Determine if an error code represents a retryable error
 */
export function isRetryableError(code: ErrorCode): boolean {
  return [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.TIMEOUT,
    ErrorCode.INTERNAL_ERROR,
    ErrorCode.DATABASE_ERROR,
    ErrorCode.EXTERNAL_SERVICE_ERROR,
  ].includes(code);
}

/**
 * Create a success response
 */
export function createSuccessResponse<T = void>(data?: T): SuccessResponse<T> {
  return {
    success: true,
    ...(data !== undefined && { data }),
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(
  errorCode: ErrorCode,
  customMessage?: string,
  options?: {
    validationErrors?: ValidationErrors;
    supportId?: string;
    details?: Record<string, unknown>;
  }
): ErrorResponse {
  return {
    success: false,
    error: customMessage || ERROR_MESSAGES[errorCode],
    errorCode,
    isRetryable: isRetryableError(errorCode),
    ...(options?.validationErrors && { validationErrors: options.validationErrors }),
    ...(options?.supportId && { supportId: options.supportId }),
    ...(options?.details && { details: options.details }),
  };
}

/**
 * Convert Zod validation errors to ValidationErrors format
 */
export function zodErrorsToValidationErrors(error: any): ValidationErrors {
  const validationErrors: ValidationErrors = {};
  
  if (error.errors && Array.isArray(error.errors)) {
    error.errors.forEach((err: any) => {
      const path = err.path.join('.');
      if (!validationErrors[path]) {
        validationErrors[path] = [];
      }
      if (Array.isArray(validationErrors[path])) {
        (validationErrors[path] as string[]).push(err.message);
      }
    });
  }
  
  return validationErrors;
}

/**
 * Generate a unique support ID for error tracking
 */
export function generateSupportId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
