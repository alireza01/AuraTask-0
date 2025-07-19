'use client';

import { useEffect, useState } from 'react';
import { GuestUserManager } from '../guest/guest-user-manager';
import { User } from '../types';

/**
 * Hook for managing guest user functionality in client components
 * @returns Object containing guest user state and functions
 */
export function useGuestUser() {
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [guestUser, setGuestUser] = useState<User | null>(null);

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
  
  return {
    isGuest,
    isInitializing,
    guestUser,
    createGuestUser,
    syncGuestData,
  };
}