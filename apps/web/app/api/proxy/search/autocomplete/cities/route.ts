import { NextRequest, NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const apiBase = getApiBase();
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const limit = url.searchParams.get('limit') || '10';
    const country = (url.searchParams.get('country') || url.searchParams.get('countryCode') || '').trim().toUpperCase();

    const callBackend = async (query: string) => {
      const backendUrl = new URL(`${apiBase}/search/autocomplete/cities`);
      if (query) backendUrl.searchParams.set('q', query);
      if (limit) backendUrl.searchParams.set('limit', limit);
      if (country) backendUrl.searchParams.set('country', country);
      const response = await fetch(backendUrl.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      const parsed = await response.json().catch(() => ({}));
      return { response, parsed };
    };

    let { response: resp, parsed: data } = await callBackend(q);

    const noResults = resp.ok && Array.isArray(data?.cities) && data.cities.length === 0;
    const hasComma = q.includes(',');

    if (noResults && hasComma) {
      const normalizedQuery = q.split(',')[0]?.trim() || q;
      if (normalizedQuery && normalizedQuery !== q) {
        const retry = await callBackend(normalizedQuery);
        if (retry.response.ok && Array.isArray(retry.parsed?.cities) && retry.parsed.cities.length > 0) {
          resp = retry.response;
          data = retry.parsed;
        }
      }
    }

    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Failed to fetch city suggestions' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
