import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';
import { withAuthHeader, withAuthHeaderFromRequest } from '@/lib/auth-headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const path = `/blog${queryString ? `?${queryString}` : ''}`;

    const apiBase = getApiBase();
    const resp = await fetch(`${apiBase}${path}`, { method: 'GET' });
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json(
        { data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } },
        { status: 200 },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiBase = getApiBase();
    const body = await request.json();
    const authConfig = withAuthHeaderFromRequest(request);
    const headers = new Headers((authConfig as any).headers || {});
    headers.set('Content-Type', 'application/json');

    const resp = await fetch(`${apiBase}/blog`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Failed to create post' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}
