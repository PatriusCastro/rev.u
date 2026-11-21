'use client';
import { useId, useRef } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from '@/app/actions';
import { Submit } from './submit';
import { ic } from './ui';

/** Sign-out button that asks first, in a sheet (phone) or dialog (larger). The native <dialog> handles focus and Escape. */
export function SignOut({ variant }: { variant: 'icon' | 'row' }) {
  const ref = useRef<HTMLDialogElement>(null);
  const title = useId();
  const cancel = useRef<HTMLButtonElement>(null);
  // Start on Cancel, so a stray Enter does not sign out.
  const open = () => { ref.current?.showModal(); cancel.current?.focus(); };
  return (
    <>
      {variant === 'icon'
        ? <button type="button" className="ib" aria-label="Sign out" title="Sign out" onClick={open}><LogOut {...ic} /></button>
        : <button type="button" onClick={open}><LogOut {...ic} />Sign out</button>}
      {/* A click on the backdrop lands on the dialog itself, so it closes; clicks inside land on the form. */}
      <dialog ref={ref} className="sheet" aria-labelledby={title} onClick={(e) => e.target === ref.current && ref.current.close()}>
        <form action={signOut}>
          <span className="tile"><LogOut {...ic} /></span>
          <h2 id={title}>Sign out of Rev.U?</h2>
          <p className="sub">Your progress is saved.</p>
          <label className="check"><input type="checkbox" name="save" defaultChecked />Save my account for one-tap sign-in on this device</label>
          <div className="pair">
            <button type="button" className="btn sec" ref={cancel} onClick={() => ref.current?.close()}>Cancel</button>
            <Submit className="btn pri" pendingText="Signing out…">Sign out</Submit>
          </div>
        </form>
      </dialog>
    </>
  );
}
