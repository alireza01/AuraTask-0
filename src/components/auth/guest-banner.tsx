'use client';

import { useState } from 'react';
import { useGuestUserContext } from '@/lib/providers/guest-user-provider';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { AuthModal } from './auth-modal';

export function GuestBanner() {
  const { isGuest } = useGuestUserContext();
  const [showBanner, setShowBanner] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // If not a guest user, don't show the banner
  if (!isGuest || !showBanner) {
    return null;
  }
  
  return (
    <>
      <div className="relative bg-yellow-50 px-4 py-3 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">
              شما در حالت مهمان هستید. برای ذخیره اطلاعات خود، لطفا ثبت‌نام کنید.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-300 bg-transparent hover:bg-yellow-100 dark:border-yellow-700 dark:hover:bg-yellow-800/50"
              onClick={() => setShowAuthModal(true)}
            >
              ثبت‌نام
            </Button>
            
            <button
              className="rounded-full p-1 hover:bg-yellow-100 dark:hover:bg-yellow-800/50"
              onClick={() => setShowBanner(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}