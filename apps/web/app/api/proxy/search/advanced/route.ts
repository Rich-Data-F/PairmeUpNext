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
    // Backend /search/advanced expects: q, brandIds, modelIds, priceMin, priceMax,
    // conditions, cityIds, verifiedOnly, hasImages, sortBy, page, limit
    const backendParams = new URLSearchParams();
    if (query) backendParams.set('q', query);
    if (page > 1) backendParams.set('page', page.toString());
    if (limit !== 20) backendParams.set('limit', limit.toString());
    if (sortBy) backendParams.set('sortBy', sortBy);
    if (brands) backendParams.set('brandIds', brands);
    if (models) backendParams.set('modelIds', models);
    if (cities) backendParams.set('cityIds', cities);
    if (conditions) backendParams.set('conditions', conditions);
    if (minPrice) backendParams.set('priceMin', minPrice);
    if (maxPrice) backendParams.set('priceMax', maxPrice);
    if (isVerified === 'true') backendParams.set('verifiedOnly', 'true');
    if (hasImages === 'true') backendParams.set('hasImages', 'true');

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
      console.warn(`⚠️ Backend search failed (${response.status}). Returning empty results.`);
      return NextResponse.json({
        listings: [],
        total: 0,
        page: page || 1,
        totalPages: 1,
        hasMore: false,
      });
    }

    const raw = await response.json();
    const listings = raw?.listings || raw?.items || [];
    const total = raw?.pagination?.total ?? raw?.total ?? listings.length ?? 0;
    const currentPage = raw?.pagination?.page ?? page ?? 1;
    const limitUsed = raw?.pagination?.limit ?? limit ?? 20;
    const totalPages = raw?.pagination?.pages ?? (limitUsed ? Math.max(1, Math.ceil(total / limitUsed)) : 1);
    const hasMore = currentPage < totalPages;

    const shaped = { listings, total, page: currentPage, totalPages, hasMore };
    console.log(`✅ Search shaped: total=${total}, page=${currentPage}, pages=${totalPages}, listings=${listings.length}`);

    return NextResponse.json(shaped);
    
  } catch (error) {
    console.error('❌ Search API error:', error);
    // Return graceful empty results so UI does not error
    return NextResponse.json({
      listings: [],
      total: 0,
      page: 1,
      totalPages: 1,
      hasMore: false,
    });
  }
}
