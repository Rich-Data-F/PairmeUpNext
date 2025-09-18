import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';

export async function GET(request: Request) {
  try {
    const apiBase = getApiBase();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const search = searchParams.get('search') || '';

    const queryParams = new URLSearchParams({ page, limit, search });
    const resp = await fetch(`${apiBase}/admin/users?${queryParams}`, await withAuthHeader());
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Failed to fetch users' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
