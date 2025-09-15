import { NextRequest } from 'next/server';
import { getApiBase } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '12';
    
    console.log(`🔍 Fetching featured listings (limit: ${limit})`);
    
  // Call backend API
  const backendUrl = `${getApiBase()}/search/featured?limit=${limit}`;
    console.log(`📡 Calling backend: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`❌ Backend error: ${response.status}`);
    // Return empty data to avoid client-side errors
      return new Response(
        JSON.stringify({ 
          listings: [],
          total: 0,
      message: 'Featured listings temporarily unavailable'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
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
    
    // Return empty results instead of error
    return new Response(
      JSON.stringify({ 
        listings: [],
        total: 0,
        message: 'Featured listings temporarily unavailable'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
