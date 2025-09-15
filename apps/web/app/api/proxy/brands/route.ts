import { NextRequest, NextResponse } from 'next/server';

import { getApiBase } from '@/lib/config';
const API_BASE_URL = getApiBase();

export async function GET(request: NextRequest) {
  try {
    console.log('🏢 Brands API called');
    
    // Forward query parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const queryString = searchParams.toString();
    
    // Always include counts for listing numbers
    const params = new URLSearchParams(queryString);
    params.set('include', '_count');
    
    const backendUrl = `${API_BASE_URL}/brands?${params.toString()}`;
    
    console.log('📡 Calling backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error('❌ Backend error:', response.status, response.statusText);
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
    
    // Return a more specific error message
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Backend request timeout' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error while fetching brands' },
      { status: 500 }
    );
  }
}
