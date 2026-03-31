import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export async function GET(_req: NextRequest) {
  try {
    const res = await backendFetch('/search/filters', { method: 'GET', timeout: 60_000, retries: 1 });
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch filters' }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
