import { type EmailOtpType } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { db } from '@/lib/supabase';

// The link in the sign-up confirmation email lands here (Supabase email template: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email).
export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null;
  if (token_hash && type) {
    const supabase = await db();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) redirect('/setup');
  }
  redirect('/login?msg=' + encodeURIComponent('That link has expired. Sign in or create the account again.'));
}
