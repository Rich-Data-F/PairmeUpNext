import { NextRequest } from 'next/server';
import { getApiBase } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching search suggestions');
    
  // Call backend API
  const backendUrl = `${getApiBase()}/search/suggestions`;
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
      // Return mock data for now
      return new Response(
        JSON.stringify({ 
          popular: ['AirPods Pro', 'Galaxy Buds', 'FreeBuds Pro', 'WF-1000XM4'],
          trending: ['Huawei FreeBuds', 'Nothing Ear', 'Pixel Buds', 'Beats Studio']
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched search suggestions`);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Search suggestions proxy error:', error);
    
    // Return mock suggestions
    return new Response(
      JSON.stringify({ 
        popular: ['AirPods Pro', 'Galaxy Buds', 'FreeBuds Pro', 'WF-1000XM4'],
        trending: ['Huawei FreeBuds', 'Nothing Ear', 'Pixel Buds', 'Beats Studio']
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
