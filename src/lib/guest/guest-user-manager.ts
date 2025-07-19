import { supabase } from "@/lib/db/supabase";
import { User } from "@/lib/types";
import { db } from "@/lib/db";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Constants for local storage keys
const GUEST_ID_KEY = 'auratask_guest_id';
const GUEST_SESSION_KEY = 'auratask_guest_session';
const LAST_SYNC_KEY = 'auratask_last_sync';

/**
 * GuestUserManager handles the creation and management of guest users
 * It provides functionality for:
 * - Creating anonymous users
 * - Persisting guest sessions
 * - Synchronizing guest data with the database
 * - Upgrading guest users to authenticated users
 */
export class GuestUserManager {
  /**
   * Initialize a guest user session
   * Creates an anonymous user if one doesn't exist
   * @returns The guest user object
   */
  static async initializeGuestUser(): Promise<User | null> {
    try {
      // Check if we already have a guest session
      const existingGuestId = localStorage.getItem(GUEST_ID_KEY);
      const existingSession = localStorage.getItem(GUEST_SESSION_KEY);

      if (existingGuestId && existingSession) {
        // Try to restore the existing session
        const { data, error } = await supabase.auth.setSession(JSON.parse(existingSession));

        if (!error && data.session && data.user) {
          console.log("Restored existing guest session");
          return this.getOrCreateUserRecord(data.user);
        }
      }

      // Create a new anonymous session
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error("Error creating anonymous user:", error);
        return null;
      }

      // Store the guest ID and session
      if (data.user) {
        localStorage.setItem(GUEST_ID_KEY, data.user.id);
        localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(data.session));

        // Create a user record in the database
        return this.getOrCreateUserRecord(data.user);
      }
      return null;
    } catch (error) {
      console.error("Error initializing guest user:", error);
      return null;
    }
  }

  /**
   * Get or create a user record in the database
   * @param authUser The authenticated user from Supabase Auth
   * @returns The user record from the database
   */
  private static async getOrCreateUserRecord(authUser: SupabaseUser): Promise<User | null> {
    try {
      // Check if user already exists in the database
      const existingUser = await db.user.findUnique({
        where: { id: authUser.id }
      });

      if (existingUser) {
        return existingUser as unknown as User;
      }

      // Create a new user record
      const newUser = await db.user.create({
        data: {
          id: authUser.id,
          email: authUser.email || `guest_${authUser.id}@auratask.temp`,
          username: `مهمان_${Math.floor(Math.random() * 10000)}`,
          theme: "default",
          darkMode: false,
          aiPreference: 0.5,
          auraPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          onboardingDone: false,
          // Remove isGuest field as it doesn't exist in the Prisma schema
        }
      });

      return newUser as unknown as User;
    } catch (error) {
      console.error("Error creating user record:", error);
      return null;
    }
  }

  /**
   * Check if the current user is a guest
   * @returns True if the user is a guest, false otherwise
   */
  static isGuestUser(): boolean {
    return !!localStorage.getItem(GUEST_ID_KEY);
  }

  /**
   * Get the guest user ID from local storage
   * @returns The guest user ID or null if not found
   */
  static getGuestUserId(): string | null {
    return localStorage.getItem(GUEST_ID_KEY);
  }

  /**
   * Synchronize guest data with the database
   * This should be called periodically to ensure data is not lost
   * @returns True if sync was successful, false otherwise
   */
  static async synchronizeGuestData(): Promise<boolean> {
    try {
      const guestId = this.getGuestUserId();

      if (!guestId) {
        return false;
      }

      // Update the last sync time
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      // In a a real implementation, we would sync any locally cached data
      // that hasn't been synchronized with the server yet.
      // For now, we'll assume data is directly persisted to Supabase
      // via Server Actions, so this function primarily updates the sync timestamp.
      // If there were client-side only changes, they would be handled here.

      return true;
    } catch (error) {
      console.error("Error synchronizing guest data:", error);
      return false;
    }
  }

  /**
   * Clean up guest user data after upgrading to an authenticated user
   * This should be called after a successful authentication
   */
  static cleanupGuestData(): void {
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(GUEST_SESSION_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
  }
}