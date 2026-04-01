import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';
import { withAuthHeaderFromRequest } from '@/lib/auth-headers';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const apiBase = getApiBase();
    const resp = await fetch(`${apiBase}/blog/${id}`, { method: 'GET' });
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const apiBase = getApiBase();
    const body = await request.json();
    const authConfig = withAuthHeaderFromRequest(request);
    const headers = new Headers((authConfig as any).headers || {});
    headers.set('Content-Type', 'application/json');

    const resp = await fetch(`${apiBase}/blog/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Failed to update post' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}
