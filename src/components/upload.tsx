'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { FileText, Upload as UploadIcon } from 'lucide-react';
import { recordDocument } from '@/app/actions';
import { ic } from './ui';

const MAX_MB = 20; // matches the bucket's file_size_limit in the migration

/** Uploads straight to the user's private storage folder, then records it. The bucket and its
 *  policies enforce PDF-only, the size cap and the quota; these checks only give faster feedback. */
export function Upload({ userId, topics }: { userId: string; topics: { id: string; name: string }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  async function submit(form: FormData) {
    const file = form.get('file') as File;
    if (!file?.size) return setMsg('Choose a PDF first.');
    if (file.type !== 'application/pdf') return setMsg('Only PDF files can be added.');
    if (file.size > MAX_MB * 1024 * 1024) return setMsg(`That file is over ${MAX_MB} MB.`);
    setBusy(true); setMsg(null);
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const path = `${userId}/${crypto.randomUUID()}.pdf`;
    const { error } = await supabase.storage.from('library').upload(path, file, { contentType: 'application/pdf' });
    const res = error ? { error: /row-level security/i.test(error.message) ? 'Your library is full (200 MB). Delete a file to add more.' : error.message }
      : await recordDocument(path, String(form.get('title') || file.name.replace(/\.pdf$/i, '')), String(form.get('topic')));
    setBusy(false);
    if (res.error) return setMsg(res.error);
    (document.getElementById('upload') as HTMLFormElement).reset();
    setFile(null);
    router.refresh();
  }

  return (
    <form id="upload" className="card form" action={submit}>
      <h2 className="label">Add a PDF</h2>
      {/* The file input covers the whole zone, so a click or a dropped file both land on it. */}
      <label className={'drop' + (file ? ' has' : '')}>
        <input name="file" type="file" accept="application/pdf,.pdf" required aria-label="PDF file" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setMsg(null); }} />
        {file ? <FileText {...ic} /> : <UploadIcon {...ic} />}
        <span className="t">{file ? file.name : 'Choose a PDF'}</span>
        <span className="sub">{file ? `${(file.size / 1048576).toFixed(1)} MB. Tap to choose another.` : `Or drop it here. Up to ${MAX_MB} MB.`}</span>
      </label>
      <label className="field">Title<input name="title" maxLength={120} placeholder={file ? file.name.replace(/\.pdf$/i, '') : 'Uses the file name if left empty'} /></label>
      <label className="field">Topic
        <select name="topic" defaultValue="">
          <option value="">No topic</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      {msg && <p className="err" role="alert" style={{ margin: 0 }}>{msg}</p>}
      <button className="btn pri full" disabled={busy}><UploadIcon {...ic} />{busy ? 'Uploading…' : 'Upload a PDF'}</button>
    </form>
  );
}
