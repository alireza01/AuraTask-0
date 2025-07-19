import { z } from 'zod';
import { ApiError, ValidationError } from '@/lib/types';

/**
 * Validates data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws Error if validation fails
 */
export function validateData<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      throw {
        code: 'VALIDATION_ERROR',
        message: 'خطا در اعتبارسنجی داده‌ها',
        details: validationErrors,
      } as ApiError;
    }
    
    throw error;
  }
}

/**
 * Formats an error for API response
 * @param error - Error object
 * @returns Formatted error object
 */
export function formatError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    return error as ApiError;
  }
  
  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message || 'خطای داخلی سرور',
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'خطای ناشناخته',
  };
}

/**
 * Safely executes a database operation with error handling
 * @param operation - Database operation to execute
 * @returns Result of the operation
 * @throws Formatted error if operation fails
 */
export async function safeOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw formatError(error);
  }
}