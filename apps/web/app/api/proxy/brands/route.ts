import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    console.log('🏢 Brands API called');
    
    const url = new URL(request.url);
    const params = new URLSearchParams(url.searchParams.toString());
    params.set('include', '_count');
    if (!params.has('limit')) params.set('limit', '100');
    
    console.log('📡 Calling backend brands');

    const response = await backendFetch(`/brands?${params.toString()}`, {
      method: 'GET',
      timeout: 60_000,
      retries: 1,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('❌ Backend error:', response.status, response.statusText, 'Body:', body);
      return NextResponse.json(
        { error: 'Failed to fetch brands from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Successfully fetched brands data');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in brands API:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching brands' },
      { status: 500 }
    );
  }
}
