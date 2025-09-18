import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const apiBase = getApiBase();
    const body = await request.json();
    const resp = await fetch(`${apiBase}/admin/models/${params.id}/reassign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(await withAuthHeader()).headers
      },
      body: JSON.stringify(body)
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Failed to reassign model' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
