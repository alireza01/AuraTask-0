'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/providers/auth-provider';
import { Loader2 } from 'lucide-react';

export default function GuestPage() {
  const { continueAsGuest, isLoading } = useAuthContext();
  const router = useRouter();
  
  useEffect(() => {
    const initializeGuestUser = async () => {
      try {
        // Create a guest user and redirect to dashboard
        await continueAsGuest();
      } catch (error) {
        console.error('Error creating guest user:', error);
        // If there's an error, redirect to home page
        router.push('/');
      }
    };
    
    if (!isLoading) {
      initializeGuestUser();
    }
  }, [continueAsGuest, router, isLoading]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h1 className="mt-6 text-2xl font-bold">در حال ایجاد حساب مهمان...</h1>
        <p className="mt-2 text-muted-foreground">
          لطفاً صبر کنید، در حال آماده‌سازی فضای کاری شما هستیم.
        </p>
      </div>
    </div>
  );
}