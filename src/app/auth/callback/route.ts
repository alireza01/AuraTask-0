import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { upgradeGuestUser } from '@/lib/actions/guest-user.actions';
import { Prisma } from '@prisma/client';

/**
 * Handle the OAuth callback from Supabase Auth
 * This route is called after a user signs in with an OAuth provider
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const guestId = requestUrl.searchParams.get('guest_id');

  // If there's no code, redirect to the home page
  if (!code) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Create a Supabase client using the cookies from the request
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Exchange the code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Error exchanging code for session:', error);
    return NextResponse.redirect(new URL('/?error=auth', request.url));
  }

  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('No user found after authentication');
    return NextResponse.redirect(new URL('/?error=no-user', request.url));
  }

  try {
    // Check if the user exists in the database
    const existingUser = await db.user.findUnique({
      where: { id: user.id }
    });

    if (!existingUser) {
      // Create a new user record
      await db.user.create({
        data: {
          id: user.id,
          email: user.email || '',
          username: user.user_metadata.name || `کاربر_${Math.floor(Math.random() * 10000)}`,
          avatar: user.user_metadata.avatar_url || null,
          theme: 'default',
          darkMode: false,
          aiPreference: 0.5,
          auraPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          onboardingDone: false,
        } satisfies Prisma.UserCreateInput
      });
    }

    // If there's a guest ID, migrate the guest data to the authenticated user
    if (guestId && guestId !== user.id) {
      await upgradeGuestUser(guestId, user.id);
    }

    // Redirect to the dashboard or onboarding based on whether the user has completed onboarding
    if (existingUser?.onboardingDone) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  } catch (error) {
    console.error('Error in auth callback:', error);
    return NextResponse.redirect(new URL('/?error=server', request.url));
  }
}