'use client';

import { useEffect, useState } from 'react';
import { AuthService } from '../auth/auth-service';
import { useRouter } from 'next/navigation';
import { GuestUserManager } from '../guest/guest-user-manager';
import { User as AppUser } from '../types';

/**
 * Hook for managing authentication in client components
 * @returns Object containing auth state and functions
 */
export function useAuth() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const router = useRouter();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        const authenticated = await AuthService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      await AuthService.signInWithGoogle();
      // The page will redirect to the OAuth provider, so we don't need to update state here
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setIsLoading(false);
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      await AuthService.signOut();
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a guest user and continue as guest
  const continueAsGuest = async (): Promise<AppUser | null> => {
    try {
      setIsLoading(true);
      const guestUser = await GuestUserManager.initializeGuestUser();
      router.push('/dashboard');
      return guestUser;
    } catch (error) {
      console.error('Error continuing as guest:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    isAuthenticated,
    user,
    signInWithGoogle,
    signOut,
    continueAsGuest,
  };
}