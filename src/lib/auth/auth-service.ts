import { supabase } from "@/lib/db/supabase";
import { GuestDataMigration } from "@/lib/guest/guest-data-migration";
import { GuestUserManager } from "@/lib/guest/guest-user-manager";

/**
 * AuthService handles authentication operations
 * It provides functionality for:
 * - Google OAuth authentication
 * - Guest-to-authenticated user migration
 * - Session management
 */
export class AuthService {
  /**
   * Sign in with Google OAuth
   * @returns Promise that resolves when the sign-in process is initiated
   */
  static async signInWithGoogle(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            // If we have a guest user, pass it as a query param for later migration
            ...(GuestUserManager.isGuestUser() && {
              guest_id: GuestUserManager.getGuestUserId() || ''
            })
          }
        }
      });
      
      if (error) {
        console.error("Error signing in with Google:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in signInWithGoogle:", error);
      throw error;
    }
  }
  
  /**
   * Handle the authentication callback
   * This should be called after the OAuth provider redirects back to the application
   * @returns The authenticated user or null if authentication failed
   */
  static async handleAuthCallback(): Promise<{ id: string; email?: string } | null> {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No session found in auth callback");
        return null;
      }
      
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found in auth callback");
        return null;
      }
      
      // Check if we need to migrate guest data
      const guestUserId = GuestUserManager.getGuestUserId();
      
      if (guestUserId && guestUserId !== user.id) {
        // Migrate data from guest to authenticated user
        await GuestDataMigration.handleAuthUpgrade(user);
      }
      
      return user;
    } catch (error) {
      console.error("Error handling auth callback:", error);
      return null;
    }
  }
  
  /**
   * Sign out the current user
   * @returns Promise that resolves when the sign-out process is complete
   */
  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in signOut:", error);
      throw error;
    }
  }
  
  /**
   * Get the current authenticated user
   * @returns The authenticated user or null if not authenticated
   */
  static async getCurrentUser(): Promise<{ id: string; email?: string } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }
  
  /**
   * Check if the user is authenticated
   * @returns True if the user is authenticated, false otherwise
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  }
}