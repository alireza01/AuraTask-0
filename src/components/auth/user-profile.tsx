'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '@/lib/providers/auth-provider';
import { User } from '@/lib/types';
import { Loader2, LogOut, Settings, User as UserIcon, ChevronDown } from 'lucide-react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentUser = user || authUser;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const firstMenuItem = dropdownRef.current?.querySelector('a, button') as HTMLElement;
      firstMenuItem?.focus();
    }
  };

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
    <div className={`relative ${className}`} dir="rtl">
      <button
        ref={buttonRef}
        className="flex items-center gap-2 rounded-full p-2 hover:bg-muted transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="منوی کاربر"
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
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-card shadow-lg ring-1 ring-black/5 backdrop-blur-sm focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <div className="py-1">
            <div className="border-b border-muted px-4 py-3">
              <p className="text-sm font-medium">{currentUser.username || 'کاربر'}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>

            <Link
              href="/settings"
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-150 focus:bg-muted focus:outline-none"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              tabIndex={0}
            >
              <Settings className="h-4 w-4" />
              <span>تنظیمات</span>
            </Link>

            <button
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-150 focus:bg-destructive/10 focus:outline-none"
              onClick={handleSignOut}
              disabled={signOutLoading}
              role="menuitem"
              tabIndex={0}
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