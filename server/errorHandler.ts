import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export interface SecureError {
  statusCode: number;
  message: string;
  userFriendlyMessage: string;
  code?: string;
}

/**
 * Central error handling utility to prevent sensitive information exposure
 */
export class ErrorHandler {
  /**
   * Sanitizes errors to prevent sensitive information leakage
   */
  static sanitizeError(error: unknown): SecureError {
    // Zod validation errors - safe to show details
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        message: 'Validation error',
        userFriendlyMessage: 'Please check your input and try again',
        code: 'VALIDATION_ERROR'
      };
    }

    // Known error types with safe messages
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Database connection errors
      if (message.includes('database') || message.includes('connection')) {
        return {
          statusCode: 500,
          message: 'Database connection error',
          userFriendlyMessage: 'Service temporarily unavailable. Please try again later.',
          code: 'DATABASE_ERROR'
        };
      }
      
      // Network/API errors
      if (message.includes('network') || message.includes('fetch')) {
        return {
          statusCode: 502,
          message: 'External service error',
          userFriendlyMessage: 'External service temporarily unavailable. Please try again later.',
          code: 'EXTERNAL_SERVICE_ERROR'
        };
      }
      
      // Authentication errors
      if (message.includes('unauthorized') || message.includes('authentication')) {
        return {
          statusCode: 401,
          message: 'Authentication required',
          userFriendlyMessage: 'Please log in to access this resource.',
          code: 'AUTH_REQUIRED'
        };
      }
      
      // Permission errors
      if (message.includes('forbidden') || message.includes('permission')) {
        return {
          statusCode: 403,
          message: 'Access forbidden',
          userFriendlyMessage: 'You do not have permission to access this resource.',
          code: 'ACCESS_FORBIDDEN'
        };
      }
    }

    // Generic fallback - never expose original error details
    return {
      statusCode: 500,
      message: 'Internal server error',
      userFriendlyMessage: 'Something went wrong. Please try again later.',
      code: 'INTERNAL_ERROR'
    };
  }

  /**
   * Express error middleware for centralized error handling
   */
  static middleware() {
    return (error: unknown, req: Request, res: Response, next: NextFunction) => {
      const secureError = ErrorHandler.sanitizeError(error);
      
      // Always log the actual error server-side (but never to client)
      console.error('[ERROR]', {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error instanceof Error ? error.stack : error
      });
      
      // Send only safe information to client
      res.status(secureError.statusCode).json({
        success: false,
        message: secureError.userFriendlyMessage,
        code: secureError.code
      });
    };
  }

  /**
   * Async handler wrapper to catch async errors
   */
  static asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

/**
 * Safe error response utility for try-catch blocks
 */
export function sendSafeError(res: Response, error: unknown) {
  const secureError = ErrorHandler.sanitizeError(error);
  
  // Log actual error server-side
  console.error('[API ERROR]', {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.stack : error
  });
  
  // Send safe response to client
  res.status(secureError.statusCode).json({
    success: false,
    message: secureError.userFriendlyMessage,
    code: secureError.code
  });
}