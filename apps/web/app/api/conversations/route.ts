import { NextRequest, NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';
import { withAuthHeader } from '@/lib/auth-headers';
export const runtime = 'nodejs';
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

  const init = await withAuthHeader({ method: 'GET', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000) });
  const response = await fetch(backendUrl, init);

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
    const body = await request.json().catch(() => ({}));
    const backendUrl = `${API_BASE_URL}/conversations`;
    const init = await withAuthHeader({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
    const resp = await fetch(backendUrl, init);
    if (!resp.ok) {
      const text = await resp.text();
      console.error('❌ Backend error creating conversation:', resp.status, text);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: resp.status });
    }
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
