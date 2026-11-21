import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowLeft, BookOpen, Repeat, Target, UserPlus, X } from 'lucide-react';
import { continueAs, forgetAccount } from '@/app/actions';
import { AuthForm, type AuthMode } from '@/components/auth-form';
import { Submit } from '@/components/submit';
import { Logo, ic } from '@/components/ui';
import { savedAccounts } from '@/lib/saved';

const POINTS = [
  { Icon: Target, text: 'A short plan every day, paced to your exam date' },
  { Icon: BookOpen, text: 'Lessons and step-by-step solutions, not just answers' },
  { Icon: Repeat, text: 'Problems you miss come back after 1, 3 and 7 days' },
];

const HEADS: Record<AuthMode | 'saved', [string, string]> = {
  saved: ['Welcome back', 'Tap your account to sign in.'],
  signin: ['Welcome back', 'Sign in to pick up where you left off.'],
  signup: ['Create your account', 'Free. Set your exam date next, and today’s plan is ready.'],
  code: ['Sign in with a code', 'No password needed. New to Rev.U? This creates your account.'],
  reset: ['Reset your password', 'Enter your email and we’ll send a link to set a new one.'],
};

// Fixed messages by code, so a link cannot put its own words on the sign-in page.
const NOTICES: Record<string, string> = {
  signed_out: 'You’re signed out. See you next session.',
  saved: 'You’re signed out. Your account is saved here, so one tap signs you back in.',
  saved_expired: 'That saved sign-in has ended. Sign in once more with your password or a code.',
  expired: 'That link has expired, was already used, or was opened on another device or browser. Try again below.',
};

export default async function Login({ searchParams }: PageProps<'/login'>) {
  const { msg, mode: m, add } = await searchParams;
  const mode: AuthMode = m === 'signup' || m === 'code' || m === 'reset' ? m : 'signin';
  // Only the emails reach the page; the saved tokens stay in the httpOnly cookie.
  const saved = (await savedAccounts()).map((a) => a.email);
  const showSaved = mode === 'signin' && !add && saved.length > 0;
  const email = mode === 'signup' ? '' : ((await cookies()).get('revu_email')?.value ?? '');
  const notice = typeof msg === 'string' ? NOTICES[msg] : undefined;
  const [head, sub] = HEADS[showSaved ? 'saved' : mode];
  return (
    <main className="auth">
      <section className="auth-brand" aria-label="About Rev.U">
        <Logo size={40} />
        <h1 className="title">Review for the Civil Engineering board exam, one day at a time.</h1>
        <ul>{POINTS.map(({ Icon, text }) => <li key={text}><span className="tile"><Icon {...ic} /></span>{text}</li>)}</ul>
      </section>
      <section className="auth-form">
        <div className="auth-head">
          <h2 className="title">{head}</h2>
          <span className="sub">{sub}</span>
        </div>
        {showSaved ? (
          <div className="card form">
            {notice && <p className="note" role="status">{notice}</p>}
            <ul className="accounts" aria-label="Accounts saved on this device">
              {saved.map((e) => (
                <li key={e}>
                  <form action={continueAs.bind(null, e)}>
                    <Submit className="acct" aria-label={`Continue as ${e}`}>
                      <span className="avatar" aria-hidden>{e[0].toUpperCase()}</span>
                      <span><span className="t">{e}</span><span className="sub">Tap to sign in</span></span>
                    </Submit>
                  </form>
                  <form action={forgetAccount.bind(null, e)}>
                    <Submit className="ib flat" aria-label={`Remove ${e} from this device`} title="Remove from this device"><X {...ic} /></Submit>
                  </form>
                </li>
              ))}
            </ul>
            <Link className="btn sec full" href="/login?add=1"><UserPlus {...ic} />Use another account</Link>
            <Link className="btn txt" href="/login?mode=signup">Create a new account</Link>
          </div>
        ) : (
          <>
            {/* key: switching mode starts the form fresh */}
            <AuthForm key={mode} mode={mode} email={email} notice={notice} />
            {mode === 'signin' && saved.length > 0 && <Link className="btn txt" href="/login"><ArrowLeft {...ic} />Back to saved accounts</Link>}
          </>
        )}
      </section>
    </main>
  );
}
