'use client';

import { useState } from 'react';
import { useAuthContext } from '@/lib/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import Image from 'next/image';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, continueAsGuest, isLoading } = useAuthContext();
  const [authLoading, setAuthLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      // The page will redirect to Google, so we don't need to close the modal
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setAuthLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setAuthLoading(true);
    try {
      await continueAsGuest();
      onClose();
    } catch (error) {
      console.error('Error continuing as guest:', error);
      setAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">به اورا تسک خوش آمدید</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            برای استفاده از تمام امکانات، وارد حساب کاربری خود شوید یا به عنوان مهمان ادامه دهید.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="flex w-full items-center justify-center gap-2 border-2 py-6"
            onClick={handleGoogleSignIn}
            disabled={authLoading || isLoading}
          >
            {authLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Image
                  src="/google-logo.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
                <span>ورود با حساب گوگل</span>
              </>
            )}
          </Button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-muted"></div>
            <span className="mx-4 flex-shrink text-xs text-muted-foreground">یا</span>
            <div className="flex-grow border-t border-muted"></div>
          </div>

          <Button
            variant="secondary"
            className="flex w-full items-center justify-center gap-2 py-6"
            onClick={handleGuestSignIn}
            disabled={authLoading || isLoading}
          >
            {authLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>ادامه به عنوان مهمان</span>
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            با ورود یا ثبت‌نام، شما{' '}
            <a href="/terms" className="text-primary hover:underline">
              شرایط استفاده
            </a>{' '}
            و{' '}
            <a href="/privacy" className="text-primary hover:underline">
              سیاست حریم خصوصی
            </a>{' '}
            ما را می‌پذیرید.
          </p>
        </div>

        <button
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}