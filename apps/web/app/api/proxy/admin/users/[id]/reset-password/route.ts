import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const apiBase = getApiBase();
    const resp = await fetch(`${apiBase}/admin/users/${params.id}/reset-password`, {
      method: 'POST',
      ...(await withAuthHeader())
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Failed to reset password' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
