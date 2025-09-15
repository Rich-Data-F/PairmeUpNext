import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    console.log('📷 Image upload API called');
    
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE || '10485760');
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    console.log('📡 Forwarding to backend:', `${API_BASE_URL}/upload/image`);

    // Forward to backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: backendFormData,
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      console.error('❌ Backend upload error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to upload image to server' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Image uploaded successfully');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in image upload API:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Upload timeout' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
}
