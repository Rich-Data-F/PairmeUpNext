import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop(); // approve or reject

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/proposed-brands/${id}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to ${action} proposed brand`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing brand action:', error);
    return NextResponse.json({ error: 'Failed to process brand action' }, { status: 500 });
  }
}
