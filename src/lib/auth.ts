import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'aedoit_session';
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'aedoit_super_secret_production_key_32bytes_long_min_2026!'
);

export interface SessionPayload {
  authenticated: boolean;
  username: string;
  iat?: number;
  exp?: number;
}

export async function signSessionToken(username: string): Promise<string> {
  return await new SignJWT({ authenticated: true, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export function verifyMasterPassword(providedPassword: string): boolean {
  const masterPassword = process.env.MASTER_PASSWORD || 'aedoit_collaborative_passphrase_2026';
  return providedPassword === masterPassword;
}

export function setSessionCookieResponse(response: NextResponse, token: string): NextResponse {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: false, // Set to true when served over HTTPS in production SSL termination
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
  return response;
}

export function clearSessionCookieResponse(response: NextResponse): NextResponse {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
