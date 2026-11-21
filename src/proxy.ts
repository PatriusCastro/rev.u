import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Refreshes the Supabase session cookie on every request and sends signed-out visitors to /login.
// This is an optimistic check only; every page and action checks the user again through Supabase.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // getClaims verifies the token (locally with asymmetric signing keys) and refreshes it when it is about to expire.
  const { data } = await supabase.auth.getClaims();
  const open = ['/login', '/auth/'].some((p) => request.nextUrl.pathname.startsWith(p));
  if (!data?.claims && !open) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return response;
}

export const config = {
  // App icons stay public: browsers and home screens fetch them without a session.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|ico)$).*)'],
};
