import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/db/supabase';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'ورود | اورا تسک',
  description: 'به اورا تسک خوش آمدید. وارد حساب کاربری خود شوید یا به عنوان مهمان ادامه دهید.',
};

export default async function SignInPage() {
  // Check if user is already authenticated
  const user = await getCurrentUser();
  
  // If already authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-lg">
        <div className="text-center">
          <Image
            src="/globe.svg"
            alt="AuraTask Logo"
            width={64}
            height={64}
            className="mx-auto"
          />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            به اورا تسک خوش آمدید
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            مدیریت وظایف خود را با اورا تسک آغاز کنید
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link href="/api/auth/google" className="block w-full">
            <Button
              variant="outline"
              className="flex w-full items-center justify-center gap-2 border-2 py-6"
            >
              <Image
                src="/google-logo.svg"
                alt="Google"
                width={20}
                height={20}
              />
              <span>ورود با حساب گوگل</span>
            </Button>
          </Link>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-muted"></div>
            <span className="mx-4 flex-shrink text-xs text-muted-foreground">یا</span>
            <div className="flex-grow border-t border-muted"></div>
          </div>
          
          <Link href="/guest" className="block w-full">
            <Button
              variant="secondary"
              className="flex w-full items-center justify-center gap-2 py-6"
            >
              <span>ادامه به عنوان مهمان</span>
            </Button>
          </Link>
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
      </div>
    </div>
  );
}