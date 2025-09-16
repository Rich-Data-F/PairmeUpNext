import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const apiBase = getApiBase();
    const resp = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await resp.json().catch(async () => {
      const text = await resp.text().catch(() => '');
      return { raw: text } as any;
    });

    if (!resp.ok) {
      console.error('Login proxy failed', {
        status: resp.status,
        statusText: resp.statusText,
        body: data,
      });
      return NextResponse.json({ error: data?.message || data?.error || resp.statusText || 'Login failed' }, { status: resp.status || 502 });
    }

    const token = data?.access_token as string | undefined;
    if (!token) {
      return NextResponse.json({ error: 'No token returned from API' }, { status: 500 });
    }

    const res = NextResponse.json({ user: data.user });
    // HttpOnly cookie for token
    res.cookies.set('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch (err: any) {
    console.error('Login proxy unexpected error', err?.message || err);
    return NextResponse.json({ error: 'Unexpected error contacting auth service' }, { status: 502 });
  }
}
