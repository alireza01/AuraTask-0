"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/db/supabase";
import { 
  UpdateUserPreferencesInput, 
  UpdateUserProfileInput,
  UserSchema,
  UpdateUserPreferencesSchema,
  UpdateUserProfileSchema
} from "@/lib/types";
import { 
  createErrorResponse, 
  createSuccessResponse, 
  createUnauthorizedResponse 
} from "@/lib/utils/response-utils";
import { safeDbOperation } from "@/lib/utils/db-utils";
import { validateData } from "@/lib/utils/error-utils";
import { revalidatePath } from "next/cache";

/**
 * Update user preferences
 * @param data - User preferences data
 * @returns Success response with updated user or error response
 */
export async function updateUserPreferences(data: UpdateUserPreferencesInput) {
  try {
    // Validate input data
    const validatedData = validateData(UpdateUserPreferencesSchema, data);
    
    const user = await getCurrentUser();
    
    if (!user) {
      return createUnauthorizedResponse();
    }
    
    const updatedUser = await safeDbOperation(async () => {
      // Update user preferences
      const updated = await db.user.update({
        where: { id: user.id },
        data: {
          theme: validatedData.theme,
          darkMode: validatedData.darkMode,
          aiPreference: validatedData.aiPreference,
          geminiApiKey: validatedData.geminiApiKey,
        },
      });
      
      return UserSchema.parse(updated);
    });
    
    revalidatePath("/settings");
    return createSuccessResponse({ user: updatedUser }, "تنظیمات با موفقیت به‌روزرسانی شد");
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return createErrorResponse("خطا در به‌روزرسانی تنظیمات کاربر");
  }
}

/**
 * Update user profile
 * @param data - User profile data
 * @returns Success response with updated user or error response
 */
export async function updateUserProfile(data: UpdateUserProfileInput) {
  try {
    // Validate input data
    const validatedData = validateData(UpdateUserProfileSchema, data);
    
    const user = await getCurrentUser();
    
    if (!user) {
      return createUnauthorizedResponse();
    }
    
    const updatedUser = await safeDbOperation(async () => {
      // Update user profile
      const updated = await db.user.update({
        where: { id: user.id },
        data: {
          username: validatedData.username,
          avatar: validatedData.avatar,
        },
      });
      
      return UserSchema.parse(updated);
    });
    
    revalidatePath("/settings");
    return createSuccessResponse({ user: updatedUser }, "پروفایل با موفقیت به‌روزرسانی شد");
  } catch (error) {
    console.error("Error updating user profile:", error);
    return createErrorResponse("خطا در به‌روزرسانی پروفایل کاربر");
  }
}

/**
 * Complete onboarding process
 * @returns Success response with updated user or error response
 */
export async function completeOnboarding() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return createUnauthorizedResponse();
    }
    
    const updatedUser = await safeDbOperation(async () => {
      // Mark onboarding as complete
      const updated = await db.user.update({
        where: { id: user.id },
        data: {
          onboardingDone: true,
        },
      });
      
      return UserSchema.parse(updated);
    });
    
    revalidatePath("/dashboard");
    return createSuccessResponse({ user: updatedUser }, "فرآیند آشنایی با برنامه با موفقیت تکمیل شد");
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return createErrorResponse("خطا در تکمیل فرآیند آشنایی با برنامه");
  }
}

/**
 * Get user statistics
 * @returns Success response with user stats or error response
 */
export async function getUserStats() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return createUnauthorizedResponse();
    }
    
    const stats = await safeDbOperation(async () => {
      // Get today's date at the start of the day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get user's tasks
      const [tasksToday, tasksCompleted, tasksTotal, userWithStreak] = await Promise.all([
        // Tasks created today
        db.task.count({
          where: {
            userId: user.id,
            createdAt: { gte: today }
          }
        }),
        // Total completed tasks
        db.task.count({
          where: {
            userId: user.id,
            status: "COMPLETED"
          }
        }),
        // Total tasks
        db.task.count({
          where: {
            userId: user.id
          }
        }),
        // Get user with streak info
        db.user.findUnique({
          where: { id: user.id },
          select: {
            currentStreak: true,
            longestStreak: true,
            auraPoints: true
          }
        })
      ]);
      
      // Calculate completion rate
      const completionRate = tasksTotal > 0 
        ? Math.round((tasksCompleted / tasksTotal) * 100) 
        : 0;
      
      return {
        tasksToday,
        tasksCompleted,
        tasksTotal,
        completionRate,
        currentStreak: userWithStreak?.currentStreak || 0,
        longestStreak: userWithStreak?.longestStreak || 0,
        auraPoints: userWithStreak?.auraPoints || 0,
        taskGroups: await db.taskGroup.count({ where: { userId: user.id } })
      };
    });
    
    return createSuccessResponse({ stats });
  } catch (error) {
    console.error("Error getting user stats:", error);
    return createErrorResponse("خطا در دریافت آمار کاربر");
  }
}