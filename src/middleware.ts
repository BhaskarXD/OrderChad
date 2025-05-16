import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Array of public paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/auth/signin',
  '/auth/register',
  '/auth/error'
];

// Array of API paths that don't require authentication
const PUBLIC_API_PATHS = [
  '/api/auth',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
  
  // Check if it's a public API path
  const isPublicApiPath = PUBLIC_API_PATHS.some(path => 
    pathname.startsWith(path)
  );
  
  // If it's a public path or a Next.js resource, allow access
  if (
    isPublicPath || 
    isPublicApiPath || 
    pathname.startsWith('/_next') || 
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Get the session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // If no token and trying to access a protected route, redirect to login
  if (!token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Check for role-based routes
  if (
    (pathname.startsWith('/products/create') ||
     pathname.startsWith('/products/edit') ||
     pathname.startsWith('/orders/manage')) &&
    token.role !== 'MANAGER' &&
    token.role !== 'ADMIN'
  ) {
    // Redirect to home if not authorized for role-specific routes
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow access to protected routes for authenticated users
  return NextResponse.next();
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all routes except for:
     * 1. /api/auth* (Next Auth routes)
     * 2. /_next (Next.js internals)
     * 3. /fonts (static files)
     * 4. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 