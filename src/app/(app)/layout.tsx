import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/db/supabase';
import { redirect } from 'next/navigation';
import { GuestBanner } from '@/components/auth/guest-banner';
import { db } from '@/lib/db';
import { MainLayout } from '@/components/layout/MainLayout';
import { User } from '@/lib/types';

export const metadata: Metadata = {
  title: 'داشبورد | اورا تسک',
  description: 'داشبورد اورا تسک',
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const user = await getCurrentUser();

  // If not authenticated, redirect to home
  if (!user) {
    redirect('/');
  }

  // Get user from database
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  // If user hasn't completed onboarding, redirect to onboarding
  if (dbUser && !dbUser.onboardingDone) {
    redirect('/onboarding');
  }

  // Check if user is a guest
  const isGuest = dbUser?.isGuest || false;

  return (
    <>
      {isGuest && <GuestBanner />}
      <MainLayout user={dbUser as User | undefined}>
        {children}
      </MainLayout>
    </>
  );
}