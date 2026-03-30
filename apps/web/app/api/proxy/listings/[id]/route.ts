import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{  id: string  }> }
) {
  const params = await context.params;
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { getApiBase } = await import('@/lib/config');
  const { withAuthHeaderFromRequest } = await import('@/lib/auth-headers');
  
  try {
    const body = await request.json();
    const authConfig = withAuthHeaderFromRequest(request);
    
    const response = await fetch(`${getApiBase()}/listings/${id}`, {
      method: 'PATCH',
      ...authConfig,
      headers: {
        ...authConfig.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return new Response(JSON.stringify(data), { 
        status: response.status, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify(data), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { getApiBase } = await import('@/lib/config');
  const { withAuthHeaderFromRequest } = await import('@/lib/auth-headers');
  
  try {
    const authConfig = withAuthHeaderFromRequest(request);
    
    const response = await fetch(`${getApiBase()}/listings/${id}`, {
      method: 'DELETE',
      ...authConfig,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return new Response(JSON.stringify(data), { 
        status: response.status, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify(data), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
