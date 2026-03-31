import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '12';
    
    console.log(`🔍 Fetching featured listings (limit: ${limit})`);
    
    const response = await backendFetch(`/search/featured?limit=${limit}`, {
      method: 'GET',
      timeout: 60_000,
      retries: 1,
    });

    if (!response.ok) {
      console.error(`❌ Backend error: ${response.status}`);
      return new Response(
        JSON.stringify({ listings: [], total: 0, message: 'Featured listings temporarily unavailable' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.listings?.length || 0} featured listings`);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('❌ Featured listings proxy error:', error);
    return new Response(
      JSON.stringify({ listings: [], total: 0, message: 'Featured listings temporarily unavailable' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
