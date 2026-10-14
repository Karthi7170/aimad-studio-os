import { NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/supabase/server';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next')?.startsWith('/') && !url.searchParams.get('next')?.startsWith('//') ? url.searchParams.get('next')! : '/';
  if (!code) return NextResponse.redirect(new URL('/login?error=Missing%20code', url.origin));
  const client = await serverSupabase();
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL('/login?error=Link%20invalid%20or%20expired', url.origin));
  return NextResponse.redirect(new URL(next, url.origin));
}
