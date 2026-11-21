import { type EmailOtpType } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { db } from '@/lib/supabase';

// Links in sign-in, confirmation and password reset emails land here, in one of two shapes:
// - our templates (supabase/templates): ?token_hash=…&type=…, works on any device;
// - Supabase's default templates (used until custom SMTP is set up): Supabase checks the link, then sends
//   ?code=… here. That code only works in the browser that asked for the email.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const token_hash = params.get('token_hash'), code = params.get('code');
  const type = params.get('type') as EmailOtpType | null;
  const supabase = await db();
  const { error } = token_hash && type ? await supabase.auth.verifyOtp({ type, token_hash })
    : code ? await supabase.auth.exchangeCodeForSession(code)
    : { error: true };
  // Today sends new accounts on to the exam date.
  if (!error) redirect(type === 'recovery' ? '/reset-password' : '/');
  redirect('/login?msg=expired');
}
