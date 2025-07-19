"use server";

import { db } from "@/lib/db";
import { GuestDataMigration } from "@/lib/guest/guest-data-migration";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils/response-utils";
import { safeDbOperation } from "@/lib/utils/db-utils";
import { revalidatePath } from "next/cache";
import { User } from "@/lib/types";

/**
 * Create a guest user record in the database
 * This is called when a guest user is created on the client side
 * @param guestId The ID of the guest user from Supabase Auth
 * @returns Success response with guest user or error response
 */
export async function createGuestUserRecord(guestId: string) {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { id: guestId }
    });
    
    if (existingUser) {
      return createSuccessResponse({ user: existingUser }, "کاربر مهمان موجود است");
    }
    
    // Create a new user record
    const newUser = await safeDbOperation(async () => {
      // Create user without the isGuest field first
      const user = await db.user.create({
        data: {
          id: guestId,
          email: `guest_${guestId}@auratask.temp`,
          username: `مهمان_${Math.floor(Math.random() * 10000)}`,
          theme: "default",
          darkMode: false,
          aiPreference: 0.5,
          auraPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          onboardingDone: false,
        }
      });
      
      // Then update the isGuest field directly in the database
      await db.$executeRaw`UPDATE users SET "isGuest" = true WHERE id = ${guestId}`;
      
      // Return the user with isGuest field set
      return { ...user, isGuest: true } as User;
    });
    
    return createSuccessResponse({ user: newUser }, "کاربر مهمان با موفقیت ایجاد شد");
  } catch (error) {
    console.error("Error creating guest user record:", error);
    return createErrorResponse("خطا در ایجاد کاربر مهمان");
  }
}

/**
 * Upgrade a guest user to an authenticated user
 * This is called after a successful authentication
 * @param guestUserId The ID of the guest user
 * @param authUserId The ID of the authenticated user
 * @returns Success response if migration was successful, error response otherwise
 */
export async function upgradeGuestUser(guestUserId: string, authUserId: string) {
  try {
    // Migrate data from guest to authenticated user
    const migrationSuccess = await GuestDataMigration.migrateGuestData(guestUserId, authUserId);
    
    if (!migrationSuccess) {
      return createErrorResponse("خطا در انتقال اطلاعات کاربر مهمان");
    }
    
    // Revalidate all paths to reflect the changes
    revalidatePath("/");
    revalidatePath("/dashboard");
    
    return createSuccessResponse({}, "ارتقا به کاربر رسمی با موفقیت انجام شد");
  } catch (error) {
    console.error("Error upgrading guest user:", error);
    return createErrorResponse("خطا در ارتقا کاربر مهمان");
  }
}

/**
 * Check if a user is a guest
 * @param userId The ID of the user to check
 * @returns True if the user is a guest, false otherwise
 */
export async function isGuestUser(userId: string): Promise<boolean> {
  try {
    // Use raw SQL query to check isGuest field
    const result = await db.$queryRaw`SELECT "isGuest" FROM users WHERE id = ${userId}`;
    const rows = result as Array<{ isGuest: boolean }>;
    
    return rows.length > 0 ? rows[0].isGuest : false;
  } catch (error) {
    console.error("Error checking if user is guest:", error);
    return false;
  }
}