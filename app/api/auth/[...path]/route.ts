import { NextResponse, type NextRequest } from 'next/server';
import { configured, getAuth } from '@/lib/auth/server';
export const runtime = 'nodejs';
type Context = { params: Promise<{ path: string[] }> };
export async function GET(request: NextRequest, context: Context) {
  if (!configured()) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  return getAuth().handler().GET(request, context);
}
export async function POST(request: NextRequest, context: Context) {
  if (!configured()) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
  // Owner-only internal workspace: OAuth sign-in may provision an identity,
  // but public email/password registration is not supported in this app.
  if (/\/sign-up(?:\/|$)/.test(request.nextUrl.pathname)) {
    return NextResponse.json({ error: 'Public registration is disabled' }, { status: 403 });
  }
  return getAuth().handler().POST(request, context);
}
