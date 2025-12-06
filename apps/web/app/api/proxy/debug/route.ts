import { NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';

export async function GET() {
  try {
    const base = getApiBase();
    const envs = {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
      API_BASE_URL: process.env.API_BASE_URL || null,
      NODE_ENV: process.env.NODE_ENV || null,
    };
    return NextResponse.json({ apiBase: base, envs });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
