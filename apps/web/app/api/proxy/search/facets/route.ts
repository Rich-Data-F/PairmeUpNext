import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export const maxDuration = 60;

const EMPTY_FACETS = { brands: [], models: [], conditions: [], cities: [], priceRanges: [] };

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    console.log(`Facets API called with query: "${searchParams.get('q') || ''}"`);

    const response = await backendFetch(`/search/facets?${searchParams.toString()}`, {
      method: 'GET',
      timeout: 60_000,
      retries: 1,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully fetched facets from backend');
      return NextResponse.json(data);
    }

    console.warn('⚠️ Backend facets failed, returning empty facets');
    return NextResponse.json(EMPTY_FACETS);
  } catch (error) {
    console.warn('⚠️ Backend facets error, returning empty facets:', error);
    return NextResponse.json(EMPTY_FACETS);
  }
}
