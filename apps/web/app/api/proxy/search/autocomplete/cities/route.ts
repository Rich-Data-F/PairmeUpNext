import { NextRequest, NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const apiBase = getApiBase();
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const limit = url.searchParams.get('limit') || '10';
    const backendUrl = new URL(`${apiBase}/search/autocomplete/cities`);
    if (q) backendUrl.searchParams.set('q', q);
    if (limit) backendUrl.searchParams.set('limit', limit);

    const resp = await fetch(backendUrl.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000) });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Failed to fetch city suggestions' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
