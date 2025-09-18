import { NextRequest, NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const apiBase = getApiBase();
    const resp = await fetch(`${apiBase}/support/seed`, await withAuthHeader({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }));
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Seed failed' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
