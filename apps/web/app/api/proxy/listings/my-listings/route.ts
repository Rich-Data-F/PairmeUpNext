import { NextRequest, NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const apiBase = getApiBase();
    const url = new URL(req.url);
    const searchParams = url.searchParams.toString();
    const backendUrl = `${apiBase}/listings/my-listings${searchParams ? `?${searchParams}` : ''}`;

    const resp = await fetch(backendUrl, await withAuthHeader({ method: 'GET' }));
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Failed to fetch listings' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
