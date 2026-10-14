import { neon } from '@neondatabase/serverless';
// The database connection string must remain on the server (never NEXT_PUBLIC_).
export function getSql() {
  if (!process.env.DATABASE_URL) throw new Error('Neon database not configured');
  return neon(process.env.DATABASE_URL);
}
