'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserProfile, completeOnboarding } from '@/lib/actions/user.actions';
import { Theme } from '@/lib/types';

interface OnboardingFormProps {
  userId: string;
}

export default function OnboardingForm({ userId }: OnboardingFormProps) {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [theme, setTheme] = useState<Theme>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Update user profile
      const profileResult = await updateUserProfile({
        username,
        avatar: avatar || undefined,
      });
      
      if (!profileResult.success) {
        setError(profileResult.error || 'خطا در به‌روزرسانی پروفایل');
        setIsLoading(false);
        return;
      }
      
      // Complete onboarding
      const onboardingResult = await completeOnboarding();
      
      if (!onboardingResult.success) {
        setError(onboardingResult.error || 'خطا در تکمیل فرآیند آشنایی با برنامه');
        setIsLoading(false);
        return;
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error in onboarding:', error);
      setError('خطایی رخ داد. لطفا دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  return (
    <div className="mt-8 space-y-6">
      {/* Step indicator */}
      <div className="flex justify-center space-x-2 rtl:space-x-reverse">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 w-2 rounded-full ${
              s === step ? 'bg-primary' : s < step ? 'bg-primary/50' : 'bg-muted'
            }`}
          />
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Username */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">نام کاربری خود را انتخاب کنید</h2>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground">
                نام کاربری
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={50}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="نام کاربری خود را وارد کنید"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                disabled={!username || username.length < 3}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Avatar */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">تصویر پروفایل خود را انتخاب کنید</h2>
            <div>
              <label htmlFor="avatar" className="block text-sm font-medium text-foreground">
                آدرس تصویر پروفایل (اختیاری)
              </label>
              <input
                id="avatar"
                name="avatar"
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://example.com/avatar.jpg"
              />
              {avatar && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={avatar}
                    alt="Avatar preview"
                    className="h-24 w-24 rounded-full object-cover"
                    onError={() => setAvatar('')}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              >
                قبلی
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Theme */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">تم مورد نظر خود را انتخاب کنید</h2>
            <div className="grid grid-cols-3 gap-4">
              <div
                className={`cursor-pointer rounded-lg border p-4 text-center ${
                  theme === 'default' ? 'border-primary bg-primary/10' : 'border-input'
                }`}
                onClick={() => setTheme('default')}
              >
                <div className="mb-2 h-12 rounded bg-background"></div>
                <span className="text-sm font-medium">پیش‌فرض</span>
              </div>
              <div
                className={`cursor-pointer rounded-lg border p-4 text-center ${
                  theme === 'alireza' ? 'border-primary bg-primary/10' : 'border-input'
                }`}
                onClick={() => setTheme('alireza')}
              >
                <div className="mb-2 h-12 rounded bg-black"></div>
                <span className="text-sm font-medium">علیرضا</span>
              </div>
              <div
                className={`cursor-pointer rounded-lg border p-4 text-center ${
                  theme === 'neda' ? 'border-primary bg-primary/10' : 'border-input'
                }`}
                onClick={() => setTheme('neda')}
              >
                <div className="mb-2 h-12 rounded bg-purple-100"></div>
                <span className="text-sm font-medium">ندا</span>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              >
                قبلی
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'در حال پردازش...' : 'شروع کنید'}
              </button>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}