'use client';

import { useState } from 'react';
import { useAuthContext } from '@/lib/providers/auth-provider';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Settings, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface UserProfileProps {
  user?: User;
  className?: string;
}

export function UserProfile({ user, className = '' }: UserProfileProps) {
  const { isLoading, signOut, user: authUser } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  
  const currentUser = user || authUser;
  
  // If still loading auth state, show loading indicator
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">در حال بارگذاری...</span>
      </div>
    );
  }
  
  // If not authenticated, don't show anything
  if (!currentUser) {
    return null;
  }
  
  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setSignOutLoading(false);
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <button
        className="flex items-center gap-2 rounded-full p-2 hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentUser.avatar ? (
          <Image
            src={currentUser.avatar}
            alt={currentUser.username || 'کاربر'}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UserIcon className="h-4 w-4" />
          </div>
        )}
        <span className="text-sm font-medium">
          {currentUser.username || 'کاربر'}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <div className="border-b border-muted px-4 py-3">
              <p className="text-sm font-medium">{currentUser.username || 'کاربر'}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
            
            <Link
              href="/settings"
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span>تنظیمات</span>
            </Link>
            
            <button
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
              disabled={signOutLoading}
            >
              {signOutLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span>خروج از حساب کاربری</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}