import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';

// GET /api/proxy/blog  — list published posts
export async function GET(request: Request) {
  try {
    const apiBase = getApiBase();
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const url = `${apiBase}/blog${qs ? `?${qs}` : ''}`;
    const resp = await fetch(url, { ...(await withAuthHeader()) });
    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

// POST /api/proxy/blog  — create a post
export async function POST(request: Request) {
  try {
    const apiBase = getApiBase();
    const body = await request.json();
    const resp = await fetch(`${apiBase}/blog`, {
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
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
