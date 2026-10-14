import { createNeonAuth } from '@neondatabase/auth/next/server';
export const configured = () => Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET && process.env.DATABASE_URL && process.env.STUDIO_OWNER_EMAIL);
export function getAuth() {
  if (!configured()) throw new Error('AI x MAD Studio OS backend is not configured.');
  return createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
  });
}
export async function requireOwner() {
  if (!configured()) return null;
  const { data: session } = await getAuth().getSession();
  const expected = process.env.STUDIO_OWNER_EMAIL?.trim().toLowerCase();
  if (!session?.user?.id || !session.user.email || session.user.email.toLowerCase() !== expected) return null;
  return { id: session.user.id, email: session.user.email };
}
