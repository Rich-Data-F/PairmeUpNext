import { NextRequest, NextResponse } from 'next/server';

import { getApiBase } from '@/lib/config';
const API_BASE_URL = getApiBase();

// GET /api/conversations - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    console.log('💬 Conversations API called');
    
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const queryString = searchParams.toString();
    
    const backendUrl = queryString 
      ? `${API_BASE_URL}/conversations?${queryString}`
      : `${API_BASE_URL}/conversations`;
    
    console.log('📡 Calling backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers
        'Authorization': request.headers.get('Authorization') || '',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('❌ Backend error:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Successfully fetched conversations');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in conversations API:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Start new conversation
export async function POST(request: NextRequest) {
  try {
  console.log('💬 Creating new conversation (stub)');
  const body = await request.json().catch(() => ({}));
  // Return a stubbed conversation to avoid auth flow until implemented
  return NextResponse.json({ id: 'conv-tmp', ...body });
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
