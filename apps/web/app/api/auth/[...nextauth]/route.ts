// NextAuth is disabled to avoid build issues
// Using custom auth system with proxies instead

export async function GET() {
  return new Response(JSON.stringify({
    error: 'NextAuth is disabled. Use /api/proxy/auth endpoints instead.'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST() {
  return new Response(JSON.stringify({
    error: 'NextAuth is disabled. Use /api/proxy/auth endpoints instead.'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' }
  });
}
