import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function withAuthHeader(init: RequestInit = {}): Promise<RequestInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
}

export function withAuthHeaderFromRequest(request: NextRequest | Request, init: RequestInit = {}): RequestInit {
  let token: string | undefined;

  // Handle NextRequest
  if (request instanceof NextRequest) {
    token = request.cookies.get('auth_token')?.value;
  } else {
    // Handle regular Request - try to get token from cookies
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const authCookie = cookies.find(c => c.startsWith('auth_token='));
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }
  }

  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
}
