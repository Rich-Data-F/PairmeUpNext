import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';

export async function GET() {
  try {
    const apiBase = getApiBase();
    const resp = await fetch(`${apiBase}/models`, await withAuthHeader());
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Failed to fetch models' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const apiBase = getApiBase();
    const body = await request.json();
    const resp = await fetch(`${apiBase}/admin/models`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await withAuthHeader()).headers
      },
      body: JSON.stringify(body)
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Failed to create model' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
