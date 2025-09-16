import { cookies } from 'next/headers';

export async function withAuthHeader(init: RequestInit = {}): Promise<RequestInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
}
