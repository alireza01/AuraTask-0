import { ApiResponse } from '@/lib/types';

/**
 * Creates a success response
 * @param data - Response data
 * @param message - Success message
 * @returns Success response object
 */
export function createSuccessResponse<T>(data?: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Creates an error response
 * @param error - Error message or object
 * @returns Error response object
 */
export function createErrorResponse(error: string | Error): ApiResponse {
  return {
    success: false,
    error: typeof error === 'string' ? error : error.message,
  };
}

/**
 * Creates an unauthorized response
 * @returns Unauthorized error response
 */
export function createUnauthorizedResponse(): ApiResponse {
  return {
    success: false,
    error: 'دسترسی غیرمجاز. لطفاً وارد شوید.',
  };
}

/**
 * Creates a not found response
 * @param entity - Entity type that was not found
 * @returns Not found error response
 */
export function createNotFoundResponse(entity: string): ApiResponse {
  return {
    success: false,
    error: `${entity} مورد نظر یافت نشد.`,
  };
}