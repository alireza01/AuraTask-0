'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../auth/auth-service';
import { useRouter } from 'next/navigation';
import { GuestUserManager } from '../guest/guest-user-manager';
import { User } from '../types';
import { useGuestUserContext } from './guest-user-provider';
import { db } from '../db';

// Define the context type
interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<User | null>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  signInWithGoogle: async () => { },
  signOut: async () => { },
  continueAsGuest: async () => null,
});

// Hook to use the auth context
export const useAuthContext = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { createGuestUser } = useGuestUserContext();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      try {
        const authenticated = await AuthService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const authUser = await AuthService.getCurrentUser();
          if (authUser) {
            // Fetch the complete user data from the database
            const dbUser = await db.user.findUnique({
              where: { id: authUser.id }
            });

            if (dbUser) {
              setUser(dbUser as User);
            }
          }
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
  const continueAsGuest = async (): Promise<User | null> => {
    try {
      setIsLoading(true);
      const guestUser = await createGuestUser();
      router.push('/dashboard');
      return guestUser;
    } catch (error) {
      console.error('Error continuing as guest:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    isLoading,
    isAuthenticated,
    user,
    signInWithGoogle,
    signOut,
    continueAsGuest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}