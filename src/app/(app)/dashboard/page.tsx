import { getCurrentUser } from '@/lib/db/supabase';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { User } from '@/lib/types';

export const metadata = {
  title: 'داشبورد | اورا تسک',
  description: 'داشبورد اورا تسک - مدیریت وظایف خود را با اورا تسک آغاز کنید',
};

export default async function DashboardPage() {
  // Check if user is authenticated
  const user = await getCurrentUser();
  
  // If not authenticated, redirect to home
  if (!user) {
    redirect('/');
  }
  
  // Get user from database
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
  }) as User | null;
  
  // If user doesn't exist in database, redirect to onboarding
  if (!dbUser) {
    redirect('/onboarding');
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">
        سلام {dbUser.username}!
      </h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-card p-6 shadow-md">
          <h2 className="text-lg font-medium">امتیاز اورا</h2>
          <p className="mt-2 text-3xl font-bold text-primary">{dbUser.auraPoints}</p>
        </div>
        
        <div className="rounded-xl bg-card p-6 shadow-md">
          <h2 className="text-lg font-medium">روزهای متوالی</h2>
          <p className="mt-2 text-3xl font-bold text-primary">{dbUser.currentStreak}</p>
        </div>
        
        <div className="rounded-xl bg-card p-6 shadow-md">
          <h2 className="text-lg font-medium">وضعیت حساب</h2>
          <p className="mt-2 text-xl font-medium">
            {dbUser.isGuest ? 'کاربر مهمان' : 'کاربر رسمی'}
          </p>
        </div>
      </div>
    </div>
  );
}