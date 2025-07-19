import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/db/supabase";
import OnboardingForm from "./onboarding-form";

export const metadata = {
  title: "آشنایی با اورا تسک | AuraTask",
  description: "به اورا تسک خوش آمدید. لطفا اطلاعات پروفایل خود را تکمیل کنید.",
};

export default async function OnboardingPage() {
  // Get the current user
  const user = await getCurrentUser();
  
  // If not authenticated, redirect to home
  if (!user) {
    redirect("/");
  }
  
  // Check if the user has already completed onboarding
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { onboardingDone: true }
  });
  
  // If onboarding is already done, redirect to dashboard
  if (dbUser?.onboardingDone) {
    redirect("/dashboard");
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            به اورا تسک خوش آمدید
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            لطفا اطلاعات پروفایل خود را تکمیل کنید تا بتوانیم تجربه بهتری برای شما فراهم کنیم.
          </p>
        </div>
        
        <OnboardingForm userId={user.id} />
      </div>
    </div>
  );
}