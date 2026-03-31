import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{  id: string  }> }
) {
  const params = await context.params;
  try {
    const { id } = await params;
    console.log(`🔍 Fetching listing details for ID: ${id}`);

    const response = await backendFetch(`/listings/${id}`, {
      method: 'GET',
      timeout: 60_000,
      retries: 1,
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
    const headers = new Headers(authConfig.headers || {});
    headers.set('Content-Type', 'application/json');
    
    const backendUrl = `${getApiBase()}/listings/${id}`;
    console.log(`🔄 PATCH request to: ${backendUrl}`);
    console.log(`📦 Request body keys: ${Object.keys(body).join(', ')}`);
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    console.log(`📊 Backend response status: ${response.status}`);
    
    if (!response.ok) {
      console.error('❌ Backend PATCH failed:', { status: response.status, error: data });
      return new Response(JSON.stringify(data), { 
        status: response.status, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    console.log(`✅ Successfully updated listing ${id}`);
    return new Response(JSON.stringify(data), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('❌ Proxy PATCH error:', error);
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
    const headers = new Headers(authConfig.headers || {});
    
    const response = await fetch(`${getApiBase()}/listings/${id}`, {
      method: 'DELETE',
      headers,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Backend DELETE failed:', { status: response.status, data });
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
    console.error('Proxy DELETE error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
