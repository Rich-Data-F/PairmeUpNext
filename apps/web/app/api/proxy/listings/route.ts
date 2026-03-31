import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const maxDuration = 60;
import { backendFetch } from '@/lib/backend-fetch';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const path = `/listings${queryString ? `?${queryString}` : ''}`;
    console.log('📡 Listings proxy →', path);

    const resp = await backendFetch(path, {
      method: 'GET',
      timeout: 60_000,
      retries: 1,
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
    return NextResponse.json({ data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
  }
}
