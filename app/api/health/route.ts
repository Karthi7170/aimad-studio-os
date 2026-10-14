import { NextResponse } from 'next/server';
import { configured } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  const ready = configured();
  return NextResponse.json(
    {
      service: 'ai-x-mad-studio-os',
      status: ready ? 'configuration-present' : 'configuration-required',
    },
    {
      status: ready ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
