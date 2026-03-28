import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';

export async function POST(request: Request) {
  try {
    const apiBase = getApiBase();
    const body = await request.json();

    const resp = await fetch(`${apiBase}/survey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await withAuthHeader()).headers,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json(
        { error: data?.message || 'Failed to submit survey' },
        { status: resp.status }
      );
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('Survey submission error:', e);
    return NextResponse.json(
      { error: 'An unexpected error occurred while submitting the survey.' },
      { status: 500 }
    );
  }
}
