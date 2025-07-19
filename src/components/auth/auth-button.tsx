'use client';

import { useState } from 'react';
import { useAuthContext } from '@/lib/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn } from 'lucide-react';
import { AuthModal } from './auth-modal';

interface AuthButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function AuthButton({ 
  variant = 'default', 
  size = 'default',
  className = ''
}: AuthButtonProps) {
  const { isLoading, isAuthenticated } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // If still loading auth state, show loading indicator
  if (isLoading) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>در حال بارگذاری...</span>
      </Button>
    );
  }
  
  // If already authenticated, don't show the button
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={() => setShowAuthModal(true)}
      >
        <LogIn className="mr-2 h-4 w-4" />
        <span>ورود</span>
      </Button>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}