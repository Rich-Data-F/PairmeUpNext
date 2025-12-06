import { NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';

export async function GET() {
  try {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/health`, { method: 'GET', signal: AbortSignal.timeout(5000) });
    const text = await res.text().catch(() => '');
    return NextResponse.json({ apiBase, status: res.status, body: text });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
