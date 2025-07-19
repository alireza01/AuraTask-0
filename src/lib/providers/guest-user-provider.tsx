'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { GuestUserManager } from '../guest/guest-user-manager';
import { useRouter } from 'next/navigation';

// Define the context type
interface GuestUserContextType {
  isGuest: boolean;
  isInitializing: boolean;
  guestUser: User | null;
  createGuestUser: () => Promise<User | null>;
  syncGuestData: () => Promise<boolean>;
}

// Create the context with default values
const GuestUserContext = createContext<GuestUserContextType>({
  isGuest: false,
  isInitializing: true,
  guestUser: null,
  createGuestUser: async () => null,
  syncGuestData: async () => false,
});

// Hook to use the guest user context
export const useGuestUserContext = () => useContext(GuestUserContext);

// Provider component
export function GuestUserProvider({ children }: { children: React.ReactNode }) {
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [guestUser, setGuestUser] = useState<User | null>(null);
  const router = useRouter();

  // Initialize guest user on component mount
  useEffect(() => {
    const initializeGuest = async () => {
      setIsInitializing(true);
      
      // Check if we're already a guest user
      const isGuestUser = GuestUserManager.isGuestUser();
      setIsGuest(isGuestUser);
      
      if (isGuestUser) {
        // We're already a guest user, try to get the user data
        const user = await GuestUserManager.initializeGuestUser();
        setGuestUser(user);
      }
      
      setIsInitializing(false);
    };
    
    initializeGuest();
  }, []);
  
  // Function to create a new guest user
  const createGuestUser = async (): Promise<User | null> => {
    setIsInitializing(true);
    const user = await GuestUserManager.initializeGuestUser();
    setGuestUser(user);
    setIsGuest(true);
    setIsInitializing(false);
    
    // Refresh the page to ensure all components have access to the guest user
    router.refresh();
    
    return user;
  };
  
  // Function to synchronize guest data
  const syncGuestData = async (): Promise<boolean> => {
    if (!isGuest) return false;
    return await GuestUserManager.synchronizeGuestData();
  };
  
  // Set up periodic synchronization
  useEffect(() => {
    if (!isGuest) return;
    
    // Sync data every 5 minutes
    const syncInterval = setInterval(() => {
      GuestUserManager.synchronizeGuestData();
    }, 5 * 60 * 1000);
    
    // Sync data when the user leaves the page
    const handleBeforeUnload = () => {
      GuestUserManager.synchronizeGuestData();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isGuest]);
  
  // Context value
  const value = {
    isGuest,
    isInitializing,
    guestUser,
    createGuestUser,
    syncGuestData,
  };
  
  return (
    <GuestUserContext.Provider value={value}>
      {children}
    </GuestUserContext.Provider>
  );
}