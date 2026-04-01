import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';

// GET /api/proxy/blog/[slug] — get single post by slug
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const apiBase = getApiBase();
    const { slug } = await params as any;
    const resp = await fetch(`${apiBase}/blog/${slug}`, {
      ...(await withAuthHeader()),
    });
    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

// PATCH /api/proxy/blog/[slug] — update a post (using slug as id here)
export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  try {
    const apiBase = getApiBase();
    const { slug } = await params as any;
    const body = await request.json();
    const resp = await fetch(`${apiBase}/blog/${slug}`, {
      method: 'PATCH',
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
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

// DELETE /api/proxy/blog/[slug] — delete a post
export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  try {
    const apiBase = getApiBase();
    const { slug } = await params as any;
    const resp = await fetch(`${apiBase}/blog/${slug}`, {
      method: 'DELETE',
      ...(await withAuthHeader()),
    });
    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
