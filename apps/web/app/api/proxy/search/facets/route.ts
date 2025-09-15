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
        console.warn('⚠️ Backend facets failed, falling back to mock data');
      }
    } catch (backendError) {
      console.warn('⚠️ Backend facets error, falling back to mock data:', backendError);
    }

    // Fallback to getting brands from brands API and other mock data
    const brandsResponse = await fetch(`${API_BASE_URL}/brands?include=_count`, {
      signal: AbortSignal.timeout(5000),
    });
    
    let brands = [];
    if (brandsResponse.ok) {
      const brandsData = await brandsResponse.json();
      brands = (brandsData.items || []).map((brand: any) => ({
        id: brand.id,
        name: brand.name,
        count: brand._count?.models || 0
      }));
    }

    // Mock data with real brands
    const mockFacetsResponse = {
      brands,
      models: [
        { id: '1', name: 'AirPods Pro (2nd generation)', count: 1 },
        { id: '2', name: 'Galaxy Buds2 Pro', count: 1 },
        { id: '3', name: 'WF-1000XM4', count: 1 },
      ],
      conditions: [
        { value: 'NEW', label: 'New', count: 2 },
        { value: 'LIKE_NEW', label: 'Like New', count: 1 },
        { value: 'GOOD', label: 'Good', count: 1 },
        { value: 'FAIR', label: 'Fair', count: 0 },
        { value: 'PARTS_ONLY', label: 'Parts Only', count: 0 },
      ],
      cities: [
        { id: '1', name: 'New York', count: 1 },
        { id: '2', name: 'Los Angeles', count: 1 },
        { id: '3', name: 'Chicago', count: 2 },
      ],
      priceRanges: [
        { min: 0, max: 100, count: 0 },
        { min: 100, max: 150, count: 1 },
        { min: 150, max: 200, count: 2 },
        { min: 200, max: 300, count: 1 },
      ],
    };
    
    console.log('📊 Returning facets with real brands data');
    return NextResponse.json(mockFacetsResponse);
    
  } catch (error) {
    console.error('Facets API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
