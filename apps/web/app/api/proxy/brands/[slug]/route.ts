import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{  slug: string  }> }
) {
  const params = await context.params;
  try {
    const { slug } = await params;
    console.log('📡 Brand detail backend:', `/brands/${slug}`);
    const res = await backendFetch(`/brands/${slug}`, {
      method: 'GET',
      timeout: 60_000,
      retries: 1,
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
