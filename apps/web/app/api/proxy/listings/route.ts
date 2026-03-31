import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const apiBase = getApiBase();
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const backendUrl = `${apiBase}/listings${queryString ? `?${queryString}` : ''}`;
    console.log('📡 Listings proxy →', backendUrl);

    const resp = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json(
        { error: data?.message || 'Failed to fetch listings' },
        { status: resp.status },
      );
    }
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('❌ Listings proxy error:', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
