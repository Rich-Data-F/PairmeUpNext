import { NextRequest, NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/brands/${params.slug}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json({ error: text || 'Failed to fetch brand' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
