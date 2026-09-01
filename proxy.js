import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow static files, images, and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg')
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('auth_session');
  let session = null;

  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      session = null;
    }
  }

  // 1. Unauthenticated user trying to access protected route -> Redirect to /login
  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Authenticated user visiting /login -> Redirect directly to /
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
