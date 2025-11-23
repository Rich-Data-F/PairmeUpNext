import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🔍 Fetching listing details for ID: ${id}`);
    
    // Call backend API
  const { getApiBase } = await import('@/lib/config');
  const backendUrl = `${getApiBase()}/listings/${id}`;
    console.log(`📡 Calling backend: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error(`❌ Backend error: ${response.status}`);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch listing',
          status: response.status,
          statusText: response.statusText 
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched listing: ${data.title}`);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Listing proxy error:', error);
    
    // Return fallback error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch listing',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
