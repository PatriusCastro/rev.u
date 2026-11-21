'use client';
import { useFormStatus } from 'react-dom';

/** A form's submit button that shows it is working while the server action runs. */
export function Submit({ className, pendingText, confirmText, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string; confirmText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} aria-busy={pending} onClick={confirmText ? (e) => { if (!confirm(confirmText)) e.preventDefault(); } : undefined} {...rest}>
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
