'use client';

import { useState } from 'react';
import { UserProfile } from '@/components/auth/user-profile';
import Link from 'next/link';
import { Home, Calendar, Settings, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { User } from '@/lib/types';

interface MainLayoutProps {
  children: React.ReactNode;
  user?: User;
}

export function MainLayout({ children, user }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed left-4 top-4 z-40 rounded-full bg-primary p-2 text-primary-foreground shadow-lg md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-30 w-64 transform bg-card shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo and app name */}
          <div className="flex items-center justify-center border-b border-border p-4">
            <Image
              src="/globe.svg"
              alt="AuraTask Logo"
              width={32}
              height={32}
            />
            <h1 className="mr-2 text-xl font-bold">اورا تسک</h1>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 space-y-1 p-4">
            <Link
              href="/dashboard"
              className="flex items-center rounded-lg p-3 text-foreground hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
            >
              <Home className="ml-3 h-5 w-5" />
              <span>داشبورد</span>
            </Link>

            <Link
              href="/timeline"
              className="flex items-center rounded-lg p-3 text-foreground hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
            >
              <Calendar className="ml-3 h-5 w-5" />
              <span>تایم‌لاین</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center rounded-lg p-3 text-foreground hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="ml-3 h-5 w-5" />
              <span>تنظیمات</span>
            </Link>
          </nav>

          {/* User profile */}
          <div className="border-t border-border p-4">
            <UserProfile user={user} className="w-full justify-start" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:mr-64">
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}