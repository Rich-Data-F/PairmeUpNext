import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export const maxDuration = 60;

const FALLBACK = {
  popular: ['AirPods Pro', 'Galaxy Buds', 'FreeBuds Pro', 'WF-1000XM4'],
  trending: ['Huawei FreeBuds', 'Nothing Ear', 'Pixel Buds', 'Beats Studio'],
};

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 Fetching search suggestions');
    const response = await backendFetch('/search/suggestions', {
      method: 'GET',
      timeout: 60_000,
      retries: 1,
    });

    if (!response.ok) {
      console.error(`❌ Backend error: ${response.status}`);
      return new Response(JSON.stringify(FALLBACK), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    console.log('✅ Successfully fetched search suggestions');
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('❌ Search suggestions proxy error:', error);
    return new Response(JSON.stringify(FALLBACK), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}
