"use client";

import { ThemeProvider } from "./theme-provider";
import { GuestUserProvider } from "./guest-user-provider";
import { AuthProvider } from "./auth-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <GuestUserProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </GuestUserProvider>
    </ThemeProvider>
  );
}