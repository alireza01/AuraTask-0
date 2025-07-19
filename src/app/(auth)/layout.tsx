import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/db/supabase';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'احراز هویت | اورا تسک',
  description: 'صفحه احراز هویت اورا تسک',
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is already authenticated
  const user = await getCurrentUser();
  
  // If already authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {children}
    </div>
  );
}