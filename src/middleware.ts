import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware will be used for authentication and route protection
export function middleware(request: NextRequest) {
  // For now, we'll just implement a basic structure
  // In future tasks, we'll implement proper authentication with Supabase
  
  // Will be used in future implementation
  // const path = request.nextUrl.pathname;
  
  // Define public routes that don't require authentication
  // Will be used in future implementation
  /* 
  const isPublicRoute = 
    path === "/" || 
    path === "/signin" || 
    path === "/guest" ||
    path.startsWith("/_next") ||
    path.startsWith("/api/public");
  */
  
  // For now, allow all routes
  return NextResponse.next();
  
  // In future implementation:
  // const isAuthenticated = request.cookies.has("auth-token");
  // 
  // if (!isAuthenticated && !isPublicRoute) {
  //   return NextResponse.redirect(new URL("/signin", request.url));
  // }
  // 
  // return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except static files, api routes, etc.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};