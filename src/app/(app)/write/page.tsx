import Link from 'next/link';
import { BookOpen, Check, ChevronRight, Flag, Plus, Users } from 'lucide-react';
import { session } from '@/lib/supabase';
import { problemTitle } from '@/lib/data';
import { resolveReport } from '@/app/actions';
import { AreaIcon, ic } from '@/components/ui';

// Everything the user has written, and reports from reviewers about their problems.
export default async function Write() {
  const { supabase, user } = await session();
  const [{ data: topics }, { data: questions }, { data: flags }] = await Promise.all([
    supabase.from('topics').select('id, name, area, classes(name)').eq('owner_id', user.id).order('name'),
    supabase.from('questions').select('id, title, topic_id, topics(name), classes(name)').eq('owner_id', user.id).order('id'),
    supabase.from('flags').select('id, note, created_at, question_id, questions!inner(owner_id, title)').eq('questions.owner_id', user.id).is('resolved_at', null).order('created_at'),
  ]);
  const audience = (c: unknown) => (c as { name: string } | null)?.name ?? 'Only you';

  return (
    <main className="view">
      <div className="vh">
        <div><h1 className="title">Write</h1><span className="sub">Lessons and problems for yourself or your class</span></div>
        <Link className="btn txt" href="/classes"><Users {...ic} />Classes</Link>
      </div>
      <div className="scroll"><div className="narrow">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Link className="btn pri full" href="/write/problem"><Plus {...ic} />New problem</Link>
          <Link className="btn sec full" href="/write/lesson"><Plus {...ic} />New lesson</Link>
        </div>

        {flags && flags.length > 0 && (
          <section className="grp">
            <h2 className="label">Reports to check</h2>
            <div className="card rows">
              {flags.map((f) => (
                <div className="item" key={f.id} style={{ gridTemplateColumns: '36px minmax(0, 1fr) auto' }}>
                  <span className="tile w"><Flag {...ic} /></span>
                  <span>
                    <Link className="t" href={`/review/${f.question_id}`}>{problemTitle(f.question_id, (f.questions as unknown as { title: string | null }).title)}</Link>
                    <span className="sub">{f.note}</span>
                  </span>
                  <form action={resolveReport.bind(null, f.id)}><button className="btn txt"><Check {...ic} />Done</button></form>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grp">
          <h2 className="label">Your lessons</h2>
          <div className="card rows">
            {topics?.length ? topics.map((t) => (
              <Link className="item" key={t.id} href={`/lesson/${t.id}`}>
                <span className="tile"><BookOpen {...ic} /></span>
                <span><span className="t">{t.name}</span><span className="sub">{t.area}, {audience(t.classes)}</span></span>
                <ChevronRight {...ic} className="chev" />
              </Link>
            )) : <p className="empty">No lessons yet. Problems can also go under the built-in topics.</p>}
          </div>
        </section>

        <section className="grp">
          <h2 className="label">Your problems</h2>
          <div className="card rows">
            {questions?.length ? questions.map((q) => (
              <Link className="item" key={q.id} href={`/review/${q.id}`}>
                <span className="tile"><AreaIcon topicId={q.topic_id} /></span>
                <span><span className="t">{problemTitle(q.id, q.title)}</span><span className="sub">{(q.topics as unknown as { name: string } | null)?.name}, {audience(q.classes)}</span></span>
                <ChevronRight {...ic} className="chev" />
              </Link>
            )) : <p className="empty">No problems yet.</p>}
          </div>
        </section>
      </div></div>
    </main>
  );
}
