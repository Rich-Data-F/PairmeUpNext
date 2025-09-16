import { NextRequest, NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';
export const runtime = 'nodejs';

const API_BASE_URL = getApiBase();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const url = `${API_BASE_URL}/conversations/${params.id}/offers`;
  const init = await withAuthHeader({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
  const resp = await fetch(url, init);
  if (!resp.ok) return NextResponse.json({ error: 'Failed to create offer' }, { status: resp.status });
  const data = await resp.json();
  return NextResponse.json(data);
}
