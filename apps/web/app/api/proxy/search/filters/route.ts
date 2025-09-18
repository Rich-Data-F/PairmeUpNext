import { NextRequest, NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';

export async function GET(_req: NextRequest) {
  try {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/search/filters`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch filters' }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
