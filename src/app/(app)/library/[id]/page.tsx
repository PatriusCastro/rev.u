import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ExternalLink, Trash } from 'lucide-react';
import { session } from '@/lib/supabase';
import { deleteDocument } from '@/app/actions';
import { Submit } from '@/components/submit';
import { ic } from '@/components/ui';

export default async function Reader({ params }: PageProps<'/library/[id]'>) {
  const { id } = await params;
  const { supabase } = await session();
  const { data: doc } = await supabase.from('documents').select('id, title, path').eq('id', id).maybeSingle();
  if (!doc) notFound();
  const { data: signed } = await supabase.storage.from('library').createSignedUrl(doc.path, 3600);

  return (
    <main className="view">
      <div className="vh">
        <Link className="ib" href="/library" aria-label="Back to Library"><ChevronLeft {...ic} /></Link>
        <div className="mid"><h1 className="t" style={{ margin: 0, fontSize: 'inherit' }}>{doc.title}</h1></div>
        <form action={deleteDocument.bind(null, doc.id)}>
          <Submit className="btn txt" style={{ color: 'var(--color-red)' }} pendingText="Deleting…" confirmText={`Delete "${doc.title}"? This cannot be undone.`}><Trash {...ic} />Delete</Submit>
        </form>
      </div>
      <div className="scroll">
        {signed ? (
          <>
            {/* Phone browsers often will not show a PDF inside the page, so the new-tab link comes first. */}
            <a className="btn sec" href={signed.signedUrl} target="_blank" rel="noreferrer"><ExternalLink {...ic} />Open in a new tab</a>
            <iframe className="reader" src={signed.signedUrl} title={doc.title} />
          </>
        ) : <p className="err">This file could not be opened. Try again later.</p>}
      </div>
    </main>
  );
}
