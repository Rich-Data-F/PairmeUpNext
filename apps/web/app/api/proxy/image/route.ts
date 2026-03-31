import { NextRequest } from 'next/server';
import { getApiBase } from '@/lib/config';

/**
 * Image proxy — rewrites private R2/MinIO URLs through the backend,
 * which has the credentials to stream the object.
 *
 * Usage: /api/proxy/image?url=<encoded-full-url>
 *        /api/proxy/image?key=<object-key>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const encodedUrl = searchParams.get('url');
  const key = searchParams.get('key');

  if (!encodedUrl && !key) {
    return new Response('Missing url or key parameter', { status: 400 });
  }

  try {
    let objectKey: string | null = key;

    // Extract the object key from a full R2 / MinIO URL
    if (!objectKey && encodedUrl) {
      const rawUrl = decodeURIComponent(encodedUrl);

      // R2 private URL pattern: https://<account>.r2.cloudflarestorage.com/<bucket>/<key>
      const r2Match = rawUrl.match(/r2\.cloudflarestorage\.com\/[^/]+\/(.+)/);
      if (r2Match) {
        objectKey = r2Match[1];
      }

      // Generic endpoint/<bucket>/<key> pattern (MinIO)
      if (!objectKey) {
        const bucketName = process.env.MINIO_BUCKET_NAME || 'earbudhub-uploads';
        const bucketMatch = rawUrl.match(new RegExp(`/${bucketName}/(.+)`));
        if (bucketMatch) {
          objectKey = bucketMatch[1];
        }
      }

      // If we still couldn't extract a key, try to proxy the URL directly
      // (for public URLs that just need a server-side fetch)
      if (!objectKey) {
        const response = await fetch(rawUrl, {
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) {
          return new Response('Image not found', { status: 404 });
        }
        const contentType = response.headers.get('content-type') || 'image/webp';
        const buffer = await response.arrayBuffer();
        return new Response(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // Route through backend serve-key — backend has R2 credentials
    const apiBase = getApiBase();
    // Use the key as-is in the path (slashes intact); backend wildcard @Get('serve-key/*') handles them
    const backendUrl = `${apiBase}/upload/serve-key/${objectKey!}`;

    const response = await fetch(backendUrl, {
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      console.error(`Image proxy: backend returned ${response.status} for key: ${objectKey}`);
      return new Response('Image not found', { status: 404 });
    }

    const contentType = response.headers.get('content-type') || 'image/webp';
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    console.error('Image proxy error:', err.message);
    return new Response('Failed to fetch image', { status: 502 });
  }
}
