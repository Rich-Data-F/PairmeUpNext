import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ id: 'offer-tmp', amount: 0, status: 'PENDING', createdAt: new Date().toISOString() });
}
