import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Supabase client for server components and actions, acting as the signed-in user. */
export async function db() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* called from a server component; the proxy refreshes the session instead */ }
      },
    },
  });
}

/** The signed-in user's id and a client, or a redirect to sign in. The token is verified, not just decoded. */
export async function session() {
  const supabase = await db();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect('/login');
  return { supabase, user: { id: data.claims.sub } };
}
