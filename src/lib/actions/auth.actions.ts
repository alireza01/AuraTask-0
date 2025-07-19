"use server";

import { db } from "@/lib/db";
import { createErrorResponse, createSuccessResponse, createUnauthorizedResponse } from "@/lib/utils/response-utils";
import { safeDbOperation } from "@/lib/utils/db-utils";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { upgradeGuestUser } from "./guest-user.actions";
import { User } from "@/lib/types";

/**
 * Handle user sign-in
 * This is called after a successful authentication
 * @param userId The ID of the authenticated user
 * @param userData User data from the authentication provider
 * @returns Success response with user or error response
 */
export async function handleUserSignIn(userId: string, userData: { email?: string; name?: string; avatar_url?: string }) {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    });
    
    if (existingUser) {
      // Update last login time
      await safeDbOperation(async () => {
        return await db.user.update({
          where: { id: userId },
          data: {
            lastActiveDate: new Date(),
          }
        });
      });
      
      return createSuccessResponse({ user: existingUser }, "ورود با موفقیت انجام شد");
    }
    
    // Create a new user record
    const newUser = await safeDbOperation(async () => {
      return await db.user.create({
        data: {
          id: userId,
          email: userData.email || '',
          username: userData.name || `کاربر_${Math.floor(Math.random() * 10000)}`,
          avatar: userData.avatar_url || null,
          theme: "default",
          darkMode: false,
          aiPreference: 0.5,
          auraPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          onboardingDone: false,
          lastActiveDate: new Date(),
        }
      });
    });
    
    return createSuccessResponse({ user: newUser }, "ثبت‌نام با موفقیت انجام شد");
  } catch (error) {
    console.error("Error handling user sign-in:", error);
    return createErrorResponse("خطا در ورود کاربر");
  }
}

/**
 * Handle guest-to-auth upgrade
 * @param guestUserId The ID of the guest user
 * @param authUserId The ID of the authenticated user
 * @returns Success response if upgrade was successful, error response otherwise
 */
export async function handleGuestToAuthUpgrade(guestUserId: string, authUserId: string) {
  try {
    // Check if the guest user exists
    const guestUser = await db.user.findUnique({
      where: { id: guestUserId }
    });
    
    // Cast to User type to access isGuest property
    const typedGuestUser = guestUser as unknown as User;
    if (!typedGuestUser || typedGuestUser.isGuest !== true) {
      return createErrorResponse("کاربر مهمان یافت نشد");
    }
    
    // Check if the authenticated user exists
    const authUser = await db.user.findUnique({
      where: { id: authUserId }
    });
    
    if (!authUser) {
      return createErrorResponse("کاربر احراز هویت شده یافت نشد");
    }
    
    // Upgrade the guest user to an authenticated user
    const result = await upgradeGuestUser(guestUserId, authUserId);
    
    if (!result.success) {
      return createErrorResponse(result.error || "خطا در ارتقا کاربر مهمان");
    }
    
    revalidatePath("/dashboard");
    return createSuccessResponse({}, "ارتقا به کاربر رسمی با موفقیت انجام شد");
  } catch (error) {
    console.error("Error handling guest-to-auth upgrade:", error);
    return createErrorResponse("خطا در ارتقا کاربر مهمان");
  }
}

/**
 * Sign out the current user
 * @returns Success response if sign-out was successful, error response otherwise
 */
export async function signOut() {
  try {
    const cookieStore = cookies();
    const supabase = createServerActionClient({ cookies: () => cookieStore });
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return createErrorResponse("خطا در خروج از حساب کاربری");
    }
    
    revalidatePath("/");
    return createSuccessResponse({}, "خروج از حساب کاربری با موفقیت انجام شد");
  } catch (error) {
    console.error("Error signing out:", error);
    return createErrorResponse("خطا در خروج از حساب کاربری");
  }
}

/**
 * Get the current user's profile
 * @returns Success response with user or unauthorized response
 */
export async function getCurrentUserProfile() {
  try {
    const cookieStore = cookies();
    const supabase = createServerActionClient({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return createUnauthorizedResponse();
    }
    
    const userProfile = await db.user.findUnique({
      where: { id: user.id }
    });
    
    if (!userProfile) {
      return createUnauthorizedResponse();
    }
    
    return createSuccessResponse({ user: userProfile });
  } catch (error) {
    console.error("Error getting current user profile:", error);
    return createErrorResponse("خطا در دریافت پروفایل کاربر");
  }
}