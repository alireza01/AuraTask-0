import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Safely execute a database operation with error handling
 * @param operation The database operation to execute
 * @returns The result of the operation
 * @throws Error if the operation fails
 */
export async function safeDbOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          throw new Error('داده‌ای با این مشخصات قبلاً ثبت شده است');
        case 'P2025': // Record not found
          throw new Error('رکورد مورد نظر یافت نشد');
        case 'P2003': // Foreign key constraint violation
          throw new Error('خطا در ارتباط بین داده‌ها');
        default:
          console.error('Database error:', error);
          throw new Error('خطا در عملیات پایگاه داده');
      }
    }
    
    // Re-throw other errors
    throw error;
  }
}