export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';

export async function POST(req: NextRequest) {
  try {
    const apiBase = getApiBase();
    const body = await req.json();
    const resp = await fetch(`${apiBase}/listings`, await withAuthHeader({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }));
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Create listing failed' }, { status: resp.status });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
