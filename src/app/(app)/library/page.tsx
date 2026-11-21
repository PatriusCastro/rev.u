import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import { session } from '@/lib/supabase';
import { Upload } from '@/components/upload';
import { ic } from '@/components/ui';

const mb = (b: number) => (b / 1048576).toFixed(1) + ' MB';
const QUOTA_MB = 200; // matches the storage quota policy in the migration
const added = new Intl.DateTimeFormat('en-PH', { day: 'numeric', month: 'short', timeZone: 'Asia/Manila' });

export default async function Library() {
  const { supabase, user } = await session();
  const [{ data: docs }, { data: topics }] = await Promise.all([
    supabase.from('documents').select('id, title, size, created_at, topics(name)').order('created_at', { ascending: false }),
    supabase.from('topics').select('id, name').order('sort'),
  ]);
  const used = (docs ?? []).reduce((n, d) => n + Number(d.size), 0);
  const share = Math.min(1, used / (QUOTA_MB * 1048576));

  return (
    <main className="view">
      <div className="vh"><div>
        <h1 className="title">Library</h1>
        <span className="sub">Your own PDFs, private to you</span>
      </div></div>
      <div className="scroll"><div className="split">
        <section className="grp">
          <div className="quota">
            <span className="label">{docs?.length ?? 0} {docs?.length === 1 ? 'file' : 'files'}</span>
            <span className="sub">{mb(used)} of {QUOTA_MB} MB used</span>
            <span className="bar" role="img" aria-label={`${Math.round(100 * share)}% of storage used`}><i className={share > 0.9 ? 'full' : undefined} style={{ width: `${100 * share}%` }} /></span>
          </div>
          <div className="card rows">
            {docs?.length ? docs.map((d) => (
              <Link className="item" key={d.id} href={`/library/${d.id}`}>
                <span className="tile"><FileText {...ic} /></span>
                <span><span className="t">{d.title}</span><span className="sub">{(d.topics as unknown as { name: string } | null)?.name ?? 'No topic'}, {mb(Number(d.size))}, added {added.format(new Date(d.created_at))}</span></span>
                <ChevronRight {...ic} className="chev" />
              </Link>
            )) : (
              <div className="empty blank">
                <span className="tile"><FileText {...ic} /></span>
                <span><span className="t">No files yet</span><span className="sub">Add review notes, past papers or handouts. Only you can open them.</span></span>
              </div>
            )}
          </div>
        </section>
        <Upload userId={user.id} topics={topics ?? []} />
      </div></div>
    </main>
  );
}
