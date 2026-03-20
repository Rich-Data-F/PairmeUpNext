import { NextRequest, NextResponse } from 'next/server';
import { getApiBase } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${getApiBase()}/search/stats`;
    console.log(`📡 Calling backend stats: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache stats for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Stats fetch failed: ${response.status}`);
    }

    const statsData = await response.json();
    return NextResponse.json(statsData);
    
  } catch (error) {
    console.error('❌ Stats API error:', error);
    return NextResponse.json({
      activeListings: 0,
      totalUsers: 0,
      totalViews: { _sum: { views: 0 } },
      error: 'Failed to fetch stats'
    }, { status: 500 });
  }
}
