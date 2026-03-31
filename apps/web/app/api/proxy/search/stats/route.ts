import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-fetch';

export const maxDuration = 60;

export async function GET(_request: NextRequest) {
  try {
    console.log('📡 Calling backend stats');
    const response = await backendFetch('/search/stats', {
      method: 'GET',
      timeout: 60_000,
      retries: 1,
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
    }, { status: 200 });
  }
}
