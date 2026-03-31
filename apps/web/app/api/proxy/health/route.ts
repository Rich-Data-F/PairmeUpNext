import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';
import { getApiBase } from '@/lib/config';

export async function GET() {
  try {
    const apiBase = getApiBase();
    const res = await backendFetch('/health', { method: 'GET', timeout: 60_000, retries: 1 });
    const text = await res.text().catch(() => '');
    return NextResponse.json({ apiBase, status: res.status, body: text });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
