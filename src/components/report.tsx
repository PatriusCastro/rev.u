'use client';
import { useState, useTransition } from 'react';
import { Flag } from 'lucide-react';
import { reportProblem } from '@/app/actions';
import { ic } from './ui';

/** Lets a reviewer tell the problem's author that something looks wrong. */
export function ReportForm({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  if (msg?.ok) return <p className="sub" role="status">{msg.text}</p>;
  if (!open) return <button className="btn txt" onClick={() => setOpen(true)}><Flag {...ic} />Report a mistake</button>;
  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); start(async () => {
      const r = await reportProblem(questionId, note);
      setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: 'Thanks. The author of this problem will see your report.' });
    }); }}>
      <label className="field">What looks wrong?
        <textarea className="area" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example: step 3 uses tan instead of sin." required />
      </label>
      {msg && <p className="err" role="alert" style={{ margin: 0 }}>{msg.text}</p>}
      <button className="btn pri full" disabled={pending} aria-busy={pending}>Send report</button>
    </form>
  );
}
