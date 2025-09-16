export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';

export async function GET() {
  try {
    const apiBase = getApiBase();
    const resp = await fetch(`${apiBase}/health`);
    const data = await resp.json().catch(() => ({}));
    const authCheck = await fetch(`${apiBase}/auth/profile`, await withAuthHeader());
    const auth = authCheck.ok ? await authCheck.json().catch(() => ({})) : { status: authCheck.status };
    return NextResponse.json({ backend: { ok: resp.ok, status: resp.status, data }, auth });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'health check failed' }, { status: 500 });
  }
}
