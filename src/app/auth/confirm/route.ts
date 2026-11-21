import { type EmailOtpType } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { db } from '@/lib/supabase';

// Links in Rev.U emails land here (templates in supabase/templates): sign-in, confirmation and password reset.
export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null;
  if (token_hash && type) {
    const supabase = await db();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    // Today sends new accounts on to the exam date.
    if (!error) redirect(type === 'recovery' ? '/reset-password' : '/');
  }
  redirect('/login?msg=expired');
}
