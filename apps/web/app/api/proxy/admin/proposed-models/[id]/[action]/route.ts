import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{  id: string; action: string  }> }
) {
  const params = await context.params;
  try {
    const { id } = params;
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop(); // approve or reject

    const body = await request.json().catch(() => null);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/proposed-models/${id}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
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
