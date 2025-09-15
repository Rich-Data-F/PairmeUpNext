// Temporary fix - auth handlers causing issues
// import { handlers } from '@/lib/auth';

// export const { GET, POST } = handlers;

// Temporary placeholder handlers
export async function GET() {
  return new Response(JSON.stringify({ error: 'Auth not configured yet' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST() {
  return new Response(JSON.stringify({ error: 'Auth not configured yet' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' }
  });
}
