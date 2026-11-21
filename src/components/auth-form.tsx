'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Mail, MailCheck } from 'lucide-react';
import { emailCode, sendReset, setPassword, signIn, signUp, type AuthState } from '@/app/actions';
import { ic } from './ui';

export type AuthMode = 'signin' | 'signup' | 'code' | 'reset';
const ACTIONS = { signin: signIn, signup: signUp, code: emailCode, reset: sendReset };

/** Password input with a show/hide button. `newPassword` tells password managers to offer a new one. */
function PasswordField({ newPassword, autoFocus, after }: { newPassword?: boolean; autoFocus?: boolean; after?: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <label className="field">
      <span className="lrow">Password{after}</span>
      <span className="pw">
        <input name="password" type={show ? 'text' : 'password'} autoComplete={newPassword ? 'new-password' : 'current-password'} minLength={newPassword ? 8 : undefined} required autoFocus={autoFocus} />
        <button type="button" className="ib" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>{show ? <EyeOff {...ic} /> : <Eye {...ic} />}</button>
      </span>
      {newPassword && <span className="sub tip">At least 8 characters.</span>}
    </label>
  );
}

const Message = ({ error, notice }: { error?: string; notice?: string }) =>
  error ? <p className="alert" role="alert">{error}</p> : notice ? <p className="note" role="status">{notice}</p> : null;

const EmailField = ({ value, autoFocus }: { value: string; autoFocus?: boolean }) => (
  <label className="field">Email
    <input name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={value} key={value} autoFocus={autoFocus} />
  </label>
);

const Primary = ({ pending, label, busy, name, value }: { pending: boolean; label: string; busy: string; name?: string; value?: string }) => (
  <button className="btn pri full" disabled={pending} aria-busy={pending} name={name} value={value}>
    {pending ? busy : label}{!pending && <ArrowRight {...ic} className="mv" />}
  </button>
);

/** Sign in with a password, create an account, sign in with an emailed code, or ask for a password reset. */
export function AuthForm({ mode, email, notice }: { mode: AuthMode; email: string; notice?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(ACTIONS[mode], { email });

  if (mode === 'reset' || (mode === 'signup' && state.sent)) {
    if (state.sent) {
      return (
        <div className="card form" role="status">
          <span className="tile"><MailCheck {...ic} /></span>
          <h2 className="t big">Check your email</h2>
          <p className="sub flat">{mode === 'reset'
            ? <>If <b>{state.email}</b> has a Rev.U account, we sent it a link to set a new password. It expires in an hour.</>
            : <>We sent a link to <b>{state.email}</b>. Open it on this device to finish creating your account.</>}</p>
          <Link className="btn sec full" href="/login" replace><ArrowLeft {...ic} />Back to sign in</Link>
        </div>
      );
    }
    return (
      <form className="card form" action={action}>
        <Message error={state.error} />
        <EmailField value={state.email} autoFocus />
        <Primary pending={pending} label="Send reset link" busy="Sending…" />
        <Link className="btn txt" href="/login" replace><ArrowLeft {...ic} />Back to sign in</Link>
      </form>
    );
  }

  if (mode === 'code') {
    return (
      <form className="card form" action={action}>
        <Message error={state.error} />
        {state.sent ? (
          <>
            <p className="sub flat">We sent a 6-digit code to <b>{state.email}</b>. It can take a minute to arrive.</p>
            <input type="hidden" name="email" value={state.email} />
            <label className="field">Code
              <input className="code" name="code" autoComplete="one-time-code" inputMode="numeric" pattern="\d{6}" maxLength={6} required autoFocus placeholder="000000" />
            </label>
            <Primary pending={pending} label="Sign in" busy="Checking…" name="intent" value="verify" />
            <div className="lrow">
              <button className="btn txt" name="intent" value="send" formNoValidate disabled={pending}>Send a new code</button>
              <Link className="btn txt" href="/login?mode=code" replace>Use another email</Link>
            </div>
          </>
        ) : (
          <>
            <EmailField value={state.email} autoFocus={!state.email} />
            <Primary pending={pending} label="Email me a code" busy="Sending…" name="intent" value="send" />
          </>
        )}
        <Link className="btn txt" href="/login" replace><KeyRound {...ic} />Use a password instead</Link>
      </form>
    );
  }

  const signup = mode === 'signup';
  return (
    <form className="card form" action={action}>
      <nav className="seg two" aria-label="Sign in or create an account">
        <Link href="/login" replace aria-current={signup ? undefined : 'page'}>Sign in</Link>
        <Link href="/login?mode=signup" replace aria-current={signup ? 'page' : undefined}>Create account</Link>
      </nav>
      <Message error={state.error} notice={notice} />
      <EmailField value={state.email} autoFocus={!state.email} />
      <PasswordField newPassword={signup} autoFocus={!!state.email}
        after={!signup && <Link className="lnk sm" href="/login?mode=reset" replace>Forgot password?</Link>} />
      <Primary pending={pending} label={signup ? 'Create account' : 'Sign in'} busy={signup ? 'Creating your account…' : 'Signing in…'} />
      <p className="or"><span>or</span></p>
      <Link className="btn sec full" href="/login?mode=code" replace><Mail {...ic} />{signup ? 'Sign up with an email code' : 'Email me a sign-in code'}</Link>
    </form>
  );
}

/** Shown after the reset link signed the user in. */
export function NewPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(setPassword, { email: '' });
  return (
    <form className="card form" action={action}>
      <Message error={state.error} />
      <PasswordField newPassword autoFocus />
      <Primary pending={pending} label="Save new password" busy="Saving…" />
    </form>
  );
}
