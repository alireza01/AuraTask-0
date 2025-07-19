import { vazirmatn } from '@/lib/fonts';
import { Button } from '@/components/ui/button';
import { AuthButton } from '@/components/auth/auth-button';
import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function HomePage() {
  // Check if user is already authenticated
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }
  
  return (
    <div className={`min-h-screen bg-gradient-to-b from-background to-background/80 ${vazirmatn.className}`}>
      <div className="container mx-auto px-4 py-16">
        <header className="mb-16 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/globe.svg"
              alt="AuraTask Logo"
              width={32}
              height={32}
              className="ml-2"
            />
            <span className="text-2xl font-bold text-primary">اورا تسک</span>
          </div>
          <div>
            <AuthButton variant="outline" size="sm" />
          </div>
        </header>
        
        <main className="flex flex-col items-center justify-between gap-12 py-12 md:flex-row">
          <div className="space-y-6 md:w-1/2">
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">
              مدیریت هوشمند وظایف با <span className="text-primary">اورا تسک</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              برنامه‌ریزی، اولویت‌بندی و پیگیری وظایف خود را با کمک هوش مصنوعی انجام دهید.
            </p>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <AuthButton size="lg" />
              <Button variant="outline" size="lg" asChild>
                <Link href="/guest">
                  ورود به عنوان مهمان
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 pt-8 sm:grid-cols-3">
              <div className="rounded-xl bg-card p-4 shadow-sm">
                <div className="mb-2 text-2xl">✨</div>
                <h3 className="font-semibold">امتیازات اورا</h3>
                <p className="text-sm text-muted-foreground">با تکمیل وظایف، امتیاز کسب کنید و پیشرفت خود را ببینید.</p>
              </div>
              
              <div className="rounded-xl bg-card p-4 shadow-sm">
                <div className="mb-2 text-2xl">🤖</div>
                <h3 className="font-semibold">هوش مصنوعی</h3>
                <p className="text-sm text-muted-foreground">از هوش مصنوعی برای اولویت‌بندی هوشمند وظایف استفاده کنید.</p>
              </div>
              
              <div className="rounded-xl bg-card p-4 shadow-sm">
                <div className="mb-2 text-2xl">🎨</div>
                <h3 className="font-semibold">تم‌های زیبا</h3>
                <p className="text-sm text-muted-foreground">از بین تم‌های متنوع و زیبا، تم مورد علاقه خود را انتخاب کنید.</p>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <div className="bg-primary/10 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="flex-1"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      📝
                    </div>
                    <div>
                      <h3 className="font-medium">نوشتن مقاله</h3>
                      <p className="text-xs text-muted-foreground">اولویت: بالا • امروز</p>
                    </div>
                    <div className="flex-1"></div>
                    <div className="h-8 w-8 rounded-full bg-primary/10"></div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      🏃
                    </div>
                    <div>
                      <h3 className="font-medium">ورزش روزانه</h3>
                      <p className="text-xs text-muted-foreground">اولویت: متوسط • امروز</p>
                    </div>
                    <div className="flex-1"></div>
                    <div className="h-8 w-8 rounded-full bg-primary/10"></div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      📚
                    </div>
                    <div>
                      <h3 className="font-medium">مطالعه کتاب</h3>
                      <p className="text-xs text-muted-foreground">اولویت: پایین • فردا</p>
                    </div>
                    <div className="flex-1"></div>
                    <div className="h-8 w-8 rounded-full bg-primary/10"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}