import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/timeline',
  '/leaderboard',
];

// Define admin routes that require admin privileges
const adminRoutes = [
  '/admin',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  const path = req.nextUrl.pathname;
  
  // Check if the route is protected and user is not authenticated
  if (protectedRoutes.some(route => path.startsWith(route)) && !session) {
    // Redirect to login page
    const redirectUrl = new URL('/', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Check if the route is admin-only and user is not an admin
  if (adminRoutes.some(route => path.startsWith(route))) {
    if (!session) {
      // Redirect to login page if not authenticated
      const redirectUrl = new URL('/', req.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Check if user has admin role
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.app_metadata?.role === 'admin';
    
    if (!isAdmin) {
      // Redirect to dashboard if not an admin
      const redirectUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return res;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/public).*)',
  ],
};