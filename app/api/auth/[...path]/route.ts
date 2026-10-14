import { NextResponse, type NextRequest } from 'next/server';
import { configured, getAuth } from '@/lib/auth/server';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  if (!configured()) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  return getAuth().handler().GET(request);
}
export async function POST(request: NextRequest) {
  if (!configured()) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  return getAuth().handler().POST(request);
}
