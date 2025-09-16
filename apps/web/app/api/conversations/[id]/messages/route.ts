import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ messages: [] });
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ id: 'tmp', content: 'stub', createdAt: new Date().toISOString() });
}
