import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Trash } from 'lucide-react';
import { session } from '@/lib/supabase';
import { deleteDocument } from '@/app/actions';
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
        <div className="mid"><span className="t">{doc.title}</span></div>
        <form action={deleteDocument.bind(null, doc.id)}><button className="btn txt" style={{ color: 'var(--color-red)' }}><Trash {...ic} />Delete</button></form>
      </div>
      <div className="scroll">
        {signed ? (
          <>
            <iframe className="reader" src={signed.signedUrl} title={doc.title} />
            <a className="btn txt" href={signed.signedUrl} target="_blank" rel="noreferrer">Open in a new tab</a>
          </>
        ) : <p className="err">This file could not be opened. Try again later.</p>}
      </div>
    </main>
  );
}
