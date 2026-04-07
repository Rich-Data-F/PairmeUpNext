import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';

// POST /api/proxy/blog/[slug]/like
export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const apiBase = getApiBase();
    const { slug } = await context.params;
    const resp = await fetch(`${apiBase}/blog/${slug}/like`, {
      method: 'POST',
    });
    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}
