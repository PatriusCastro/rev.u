import { cookies } from 'next/headers';
import { BookOpen, Repeat, Target } from 'lucide-react';
import { AuthForm, type AuthMode } from '@/components/auth-form';
import { Logo, ic } from '@/components/ui';

const POINTS = [
  { Icon: Target, text: 'A short plan every day, paced to your exam date' },
  { Icon: BookOpen, text: 'Lessons and step-by-step solutions, not just answers' },
  { Icon: Repeat, text: 'Problems you miss come back after 1, 3 and 7 days' },
];

const HEADS: Record<AuthMode, [string, string]> = {
  signin: ['Welcome back', 'Sign in to pick up where you left off.'],
  signup: ['Create your account', 'Free. Set your exam date next, and today’s plan is ready.'],
  code: ['Sign in with a code', 'No password needed. New to Rev.U? This creates your account.'],
  reset: ['Reset your password', 'Enter your email and we’ll send a link to set a new one.'],
};

// Fixed messages by code, so a link cannot put its own words on the sign-in page.
const NOTICES: Record<string, string> = {
  signed_out: 'You’re signed out. See you next session.',
  expired: 'That link has expired or was already used. Try again below.',
};

export default async function Login({ searchParams }: PageProps<'/login'>) {
  const { msg, mode: m } = await searchParams;
  const mode: AuthMode = m === 'signup' || m === 'code' || m === 'reset' ? m : 'signin';
  const email = mode === 'signup' ? '' : ((await cookies()).get('revu_email')?.value ?? '');
  const [head, sub] = HEADS[mode];
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
        {/* key: switching mode starts the form fresh */}
        <AuthForm key={mode} mode={mode} email={email} notice={typeof msg === 'string' ? NOTICES[msg] : undefined} />
      </section>
    </main>
  );
}
