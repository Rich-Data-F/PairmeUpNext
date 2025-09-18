import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/proposed-brands`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch proposed brands');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching proposed brands:', error);
    return NextResponse.json({ error: 'Failed to fetch proposed brands' }, { status: 500 });
  }
}
