import { NextRequest, NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Extract search parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const brands = searchParams.get('brands');
    const models = searchParams.get('models');
    const cities = searchParams.get('cities');
    const conditions = searchParams.get('conditions');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isVerified = searchParams.get('isVerified');
    const hasImages = searchParams.get('hasImages');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log(`🔍 Advanced search API called with query: "${query}", page: ${page}`);

    // Build query parameters for the backend API
    const backendParams = new URLSearchParams();
    if (query) backendParams.set('q', query);
    if (page > 1) backendParams.set('page', page.toString());
    if (limit !== 20) backendParams.set('limit', limit.toString());
    if (sortBy !== 'relevance') backendParams.set('sortBy', sortBy);
    if (brands) backendParams.set('brandIds', brands);
    if (models) backendParams.set('modelIds', models);
    if (cities) backendParams.set('cityIds', cities);
    if (conditions) backendParams.set('conditions', conditions);
    if (minPrice) backendParams.set('priceMin', minPrice);
    if (maxPrice) backendParams.set('priceMax', maxPrice);
    if (isVerified) backendParams.set('verifiedOnly', isVerified);
    if (hasImages) backendParams.set('hasImages', hasImages);

  // Call the real backend API
  const backendUrl = `${getApiBase()}/search/advanced?${backendParams.toString()}`;
    console.log(`📡 Calling backend: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Backend returned ${data.listings?.length || 0} listings, applied ${data.appliedFilters || 0} filters`);

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Search API error:', error);
    
    // Return a fallback response in case of errors
    return NextResponse.json(
      { 
        error: 'Search service temporarily unavailable',
        listings: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        aggregations: { brands: [], models: [], conditions: [], priceRange: { min: 0, max: 1000 }, locations: [], totalListings: 0 }
      },
      { status: 500 }
    );
  }
}
