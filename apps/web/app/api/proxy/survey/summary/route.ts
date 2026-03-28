import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';

export async function GET() {
  try {
    const apiBase = getApiBase();
    const resp = await fetch(`${apiBase}/survey/summary`, {
      cache: 'no-store'
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json(
        { error: data?.message || 'Failed to fetch survey summary' },
        { status: resp.status }
      );
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('Survey summary fetch error:', e);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
