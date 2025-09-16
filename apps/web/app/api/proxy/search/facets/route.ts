import { NextRequest, NextResponse } from 'next/server';

import { getApiBase } from '@/lib/config';
const API_BASE_URL = getApiBase();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    
    console.log(`Facets API called with query: "${query}"`);
    
    // Try to get real facets from backend
    try {
      const backendUrl = `${API_BASE_URL}/search/facets?${searchParams.toString()}`;
      console.log('📡 Calling backend facets:', backendUrl);
      
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Successfully fetched facets from backend');
        return NextResponse.json(data);
      } else {
        console.warn('⚠️ Backend facets failed, returning empty facets');
        return NextResponse.json({ brands: [], models: [], conditions: [], cities: [], priceRanges: [] });
      }
    } catch (backendError) {
      console.warn('⚠️ Backend facets error, returning empty facets:', backendError);
      return NextResponse.json({ brands: [], models: [], conditions: [], cities: [], priceRanges: [] });
    }
    // If we got here without returning, return empty facets
    console.log('📊 Returning empty facets');
    return NextResponse.json({ brands: [], models: [], conditions: [], cities: [], priceRanges: [] });
    
  } catch (error) {
    console.error('Facets API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
