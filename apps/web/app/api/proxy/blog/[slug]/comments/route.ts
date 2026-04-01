import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';

// POST /api/proxy/blog/[slug]/comments
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const apiBase = getApiBase();
    const { slug } = await params as any;
    const body = await request.json();
    const resp = await fetch(`${apiBase}/blog/${slug}/comments`, {
      method: 'POST',
      ...(await withAuthHeader()),
      headers: {
        ...Object.fromEntries((await withAuthHeader()).headers as any),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
