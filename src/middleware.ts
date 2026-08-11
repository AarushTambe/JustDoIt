import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'aedoit_session';
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'aedoit_super_secret_production_key_32bytes_long_min_2026!'
);

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/health', '/manifest.json', '/sw.js', '/favicon.ico', '/icon-192.png', '/icon-512.png'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static Next.js assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  let isValid = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  // If unauthorized API request
  if (!isValid && pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // If unauthorized page request, redirect to /login
  if (!isValid && !pathname.startsWith('/login')) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user visits /login, redirect to / (home)
  if (isValid && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
