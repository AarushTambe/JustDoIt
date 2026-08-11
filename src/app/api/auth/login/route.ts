import { NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/validations';
import { verifyMasterPassword, signSessionToken, setSessionCookieResponse } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input format', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { password, username } = result.data;

    if (!verifyMasterPassword(password)) {
      return NextResponse.json({ error: 'Incorrect passphrase' }, { status: 401 });
    }

    const token = await signSessionToken(username || 'User A');
    const response = NextResponse.json({ success: true, username });
    return setSessionCookieResponse(response, token);
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
