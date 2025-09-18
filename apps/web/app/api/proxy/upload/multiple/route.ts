import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getApiBase } from '@/lib/config';
import { withAuthHeaderFromRequest } from '@/lib/auth-headers';

export async function POST(request: Request) {
  try {
    const apiBase = getApiBase();
    const formData = await request.formData();

    // Get auth headers
    const authConfig = withAuthHeaderFromRequest(request);

    // Forward the multipart form data to the backend
    const resp = await fetch(`${apiBase}/upload/multiple`, {
      method: 'POST',
      ...authConfig,
      // Don't set Content-Type for FormData, let browser set it with boundary
      body: formData
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || 'Failed to upload images' }, { status: resp.status });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
