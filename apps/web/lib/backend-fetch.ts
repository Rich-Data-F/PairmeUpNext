import { getApiBase } from './config';

/**
 * Fetch from the backend API with retry logic to handle Render cold starts.
 * Render free-tier services sleep after inactivity and can take 30-60s to wake.
 * This helper retries once after a timeout, giving the backend time to spin up.
 */
export async function backendFetch(
  path: string,
  options: RequestInit & { timeout?: number; retries?: number } = {},
): Promise<Response> {
  const { timeout = 60_000, retries = 1, ...fetchOpts } = options;
  const url = path.startsWith('http') ? path : `${getApiBase()}${path}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        ...fetchOpts,
        signal: controller.signal,
      });

      clearTimeout(timer);
      return res;
    } catch (err: any) {
      lastError = err;
      const isTimeout = err?.name === 'AbortError' || err?.name === 'TimeoutError' || err?.code === 23;
      if (!isTimeout || attempt >= retries) throw err;
      // Wait a moment then retry — the first request likely woke Render
      console.log(`⏳ Backend timeout on attempt ${attempt + 1}, retrying in 2s… (${url})`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  throw lastError || new Error('backendFetch failed');
}

/**
 * Convenience: fetch JSON from backend with retry.
 * Returns parsed JSON or null on failure.
 */
export async function backendFetchJSON<T = any>(
  path: string,
  options: RequestInit & { timeout?: number; retries?: number } = {},
): Promise<{ data: T | null; status: number; ok: boolean }> {
  try {
    const res = await backendFetch(path, {
      headers: { 'Content-Type': 'application/json', ...options.headers as any },
      ...options,
    });
    const data = await res.json().catch(() => null);
    return { data, status: res.status, ok: res.ok };
  } catch (err) {
    console.error(`❌ backendFetchJSON(${path}) error:`, err);
    return { data: null, status: 0, ok: false };
  }
}
