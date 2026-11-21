import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import { session } from '@/lib/supabase';
import { Upload } from '@/components/upload';
import { ic } from '@/components/ui';

const mb = (b: number) => (b / 1048576).toFixed(1) + ' MB';

export default async function Library() {
  const { supabase, user } = await session();
  const [{ data: docs }, { data: topics }] = await Promise.all([
    supabase.from('documents').select('id, title, size, topics(name)').order('created_at', { ascending: false }),
    supabase.from('topics').select('id, name').order('sort'),
  ]);
  const used = (docs ?? []).reduce((n, d) => n + Number(d.size), 0);

  return (
    <main className="view">
      <div className="vh"><div>
        <h1 className="title">Library</h1>
        <span className="sub">Your own PDFs, private to you. {mb(used)} of 200 MB used.</span>
      </div></div>
      <div className="scroll"><div className="split">
        <div className="card rows">
          {docs?.length ? docs.map((d) => (
            <Link className="item" key={d.id} href={`/library/${d.id}`}>
              <span className="tile"><FileText {...ic} /></span>
              <span><span className="t">{d.title}</span><span className="sub">{(d.topics as unknown as { name: string } | null)?.name ?? 'No topic'}, {mb(Number(d.size))}</span></span>
              <ChevronRight {...ic} className="chev" />
            </Link>
          )) : <p className="empty">No files yet. PDFs you upload are stored here, and only you can open them.</p>}
        </div>
        <Upload userId={user.id} topics={topics ?? []} />
      </div></div>
    </main>
  );
}
