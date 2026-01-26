import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NotificationService } from './notification.service';

/**
 * Error types for categorizing errors
 */
export enum ErrorType {
  /** Network/HTTP errors */
  HTTP = 'HTTP',
  /** Validation errors */
  VALIDATION = 'VALIDATION',
  /** Business logic errors */
  BUSINESS = 'BUSINESS',
  /** Unknown/unexpected errors */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Structured error information
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  context?: string;
  originalError?: unknown;
  statusCode?: number;
}

/**
 * HTTP error messages mapped by status code
 */
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'You are not authenticated. Please log in.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'Request timeout. Please try again.',
  409: 'Conflict with existing data.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please wait and try again.',
  500: 'Server error. Please try again later.',
  502: 'Bad gateway. Please try again later.',
  503: 'Service unavailable. Please try again later.',
  504: 'Gateway timeout. Please try again later.',
};

/**
 * Centralized error handling service.
 * 
 * Provides consistent error handling across the application:
 * - Logs errors to console for debugging
 * - Shows user-friendly notifications
 * - Handles HTTP errors with specific messages
 * - Supports contextual error information
 * 
 * @example
 * ```typescript
 * // In a component or service
 * this.apiService.getData().subscribe({
 *   next: (data) => { ... },
 *   error: (err) => this.errorHandler.handle(err, 'Loading data')
 * });
 * 
 * // For silent logging without notification
 * this.errorHandler.log(error, 'Background task');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private notificationService = inject(NotificationService);

  /**
   * Handle an error with logging and user notification.
   * 
   * @param error - The error to handle
   * @param context - Optional context describing where the error occurred
   * @param showNotification - Whether to show a user notification (default: true)
   * @returns ErrorInfo object with parsed error details
   */
  handle(error: unknown, context?: string, showNotification = true): ErrorInfo {
    const errorInfo = this.parseError(error, context);
    
    // Always log to console for debugging
    this.logError(errorInfo);
    
    // Show notification to user if enabled
    if (showNotification) {
      this.notificationService.showError(errorInfo.message);
    }
    
    return errorInfo;
  }

  /**
   * Log an error without showing a notification.
   * Useful for background tasks or non-critical errors.
   * 
   * @param error - The error to log
   * @param context - Optional context describing where the error occurred
   * @returns ErrorInfo object with parsed error details
   */
  log(error: unknown, context?: string): ErrorInfo {
    return this.handle(error, context, false);
  }

  /**
   * Handle an HTTP error with appropriate messaging.
   * 
   * @param error - The HTTP error response
   * @param context - Optional context
   * @returns ErrorInfo object
   */
  handleHttpError(error: HttpErrorResponse, context?: string): ErrorInfo {
    return this.handle(error, context);
  }

  /**
   * Show a custom error message without an actual error object.
   * Useful for validation or business logic errors.
   * 
   * @param message - The error message to display
   * @param context - Optional context for logging
   */
  showError(message: string, context?: string): void {
    const errorInfo: ErrorInfo = {
      type: ErrorType.BUSINESS,
      message,
      context,
    };
    
    this.logError(errorInfo);
    this.notificationService.showError(message);
  }

  /**
   * Parse an error into a structured ErrorInfo object.
   */
  private parseError(error: unknown, context?: string): ErrorInfo {
    // Handle HTTP errors
    if (error instanceof HttpErrorResponse) {
      return this.parseHttpError(error, context);
    }
    
    // Handle standard Error objects
    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN,
        message: error.message || 'An unexpected error occurred',
        context,
        originalError: error,
      };
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return {
        type: ErrorType.UNKNOWN,
        message: error,
        context,
        originalError: error,
      };
    }
    
    // Handle unknown error types
    return {
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred',
      context,
      originalError: error,
    };
  }

  /**
   * Parse an HTTP error into an ErrorInfo object.
   */
  private parseHttpError(error: HttpErrorResponse, context?: string): ErrorInfo {
    // Try to extract message from response body
    let message = this.extractHttpErrorMessage(error);
    
    // Fall back to predefined messages by status code
    if (!message) {
      message = HTTP_ERROR_MESSAGES[error.status] || `Error ${error.status}: ${error.statusText}`;
    }
    
    return {
      type: ErrorType.HTTP,
      message,
      context,
      originalError: error,
      statusCode: error.status,
    };
  }

  /**
   * Try to extract a meaningful error message from HTTP response body.
   */
  private extractHttpErrorMessage(error: HttpErrorResponse): string | null {
    const errorBody = error.error;
    
    if (!errorBody) {
      return null;
    }
    
    // Handle common API error response formats
    if (typeof errorBody === 'string') {
      return errorBody;
    }
    
    if (typeof errorBody === 'object') {
      // Common patterns: { message: '...' }, { error: '...' }, { errors: [...] }
      if (errorBody.message && typeof errorBody.message === 'string') {
        return errorBody.message;
      }
      if (errorBody.error && typeof errorBody.error === 'string') {
        return errorBody.error;
      }
      if (Array.isArray(errorBody.errors) && errorBody.errors.length > 0) {
        return errorBody.errors[0]?.message || errorBody.errors[0];
      }
    }
    
    return null;
  }

  /**
   * Log error to console with formatting.
   */
  private logError(errorInfo: ErrorInfo): void {
    const prefix = errorInfo.context ? `[${errorInfo.context}]` : '[Error]';
    
    console.error(
      `${prefix} ${errorInfo.type}:`,
      errorInfo.message,
      errorInfo.originalError || ''
    );
  }
}

