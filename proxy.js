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

  if (session) {
    // 3. Enforce password change on first login
    if (session.mustChangePassword && pathname !== '/change-password') {
      return NextResponse.redirect(new URL('/change-password', request.url));
    }

    const isMultimediaOnly =
      session.role === 'MULTIMEDIA' ||
      session.role === 'LEADER' ||
      (session.username && session.username.toLowerCase().includes('multimedia'));

    // 3. Strict Restriction for Multimedia & Leaders
    // They are ONLY allowed to access /multimedia, /calendario, and /configuracion.
    // Anything else (including the Dashboard /) redirects them to /multimedia.
    if (isMultimediaOnly) {
      const allowedPaths = ['/multimedia', '/calendario', '/configuracion', '/change-password'];
      // If they try to go anywhere else (like '/', '/agenda', '/membresia'), block and redirect.
      if (!allowedPaths.some(p => pathname.startsWith(p)) && pathname !== '/multimedia') {
        return NextResponse.redirect(new URL('/multimedia', request.url));
      }
    } else {
      // 4. Pastoral Agenda (/agenda) is exclusive for Pastor, Coordinator, Secretary & Admin
      // (This applies for general users that aren't strictly multimedia but still aren't allowed to see agenda)
      if (pathname.startsWith('/agenda')) {
        const allowedRoles = ['PASTOR', 'COORDINADOR', 'SECRETARIA', 'ADMIN'];
        if (!allowedRoles.includes(session.role)) {
          return NextResponse.redirect(new URL('/multimedia', request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
