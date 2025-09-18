import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop(); // approve or reject

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/proposed-models/${id}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to ${action} proposed model`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing model action:', error);
    return NextResponse.json({ error: 'Failed to process model action' }, { status: 500 });
  }
}
