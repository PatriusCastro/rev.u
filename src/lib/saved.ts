import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { SUPABASE_KEY, SUPABASE_URL } from './supabase';

/** Accounts saved on this browser for one-tap sign-in: each keeps its signed-out session's refresh token.
 *  The cookie is httpOnly, so page scripts cannot read the tokens; pages only ever get the emails. */
export type Saved = { email: string; token: string };
const NAME = 'revu_saved';
const MAX = 3;

export async function savedAccounts(): Promise<Saved[]> {
  try {
    const list = JSON.parse((await cookies()).get(NAME)?.value ?? '[]');
    return Array.isArray(list) ? list.filter((a) => typeof a?.email === 'string' && typeof a?.token === 'string') : [];
  } catch { return []; }
}

export async function writeSaved(list: Saved[]) {
  const store = await cookies();
  if (!list.length) return store.delete(NAME);
  store.set(NAME, JSON.stringify(list.slice(0, MAX)), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' });
}

/** End a saved session on the server, so its token is useless even if the cookie was copied. */
export async function revoke(token: string) {
  const client = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await client.auth.refreshSession({ refresh_token: token });
  if (data.session) await client.auth.signOut({ scope: 'local' });
}
