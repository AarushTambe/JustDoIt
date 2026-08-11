import { NextResponse } from 'next/server';
import { clearSessionCookieResponse } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  return clearSessionCookieResponse(response);
}
