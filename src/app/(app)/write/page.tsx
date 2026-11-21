import Link from 'next/link';
import { BookOpen, Check, ChevronRight, Flag, ListChecks, Plus, Users } from 'lucide-react';
import { session } from '@/lib/supabase';
import { problemTitle } from '@/lib/data';
import { resolveReport } from '@/app/actions';
import { AreaIcon, ic } from '@/components/ui';

// Everything the user has written, and reports from reviewers about their problems.
export default async function Write() {
  const { supabase, user } = await session();
  const [{ data: topics }, { data: questions }, { data: flags }, { data: quizzes }] = await Promise.all([
    supabase.from('topics').select('id, name, area, classes(name)').eq('owner_id', user.id).order('name'),
    supabase.from('questions').select('id, title, topic_id, topics(name), classes(name)').eq('owner_id', user.id).order('id'),
    supabase.from('flags').select('id, note, created_at, question_id, questions!inner(owner_id, title)').eq('questions.owner_id', user.id).is('resolved_at', null).order('created_at'),
    supabase.from('quizzes').select('id, title, minutes, question_ids, classes(name)').eq('owner_id', user.id).order('created_at', { ascending: false }),
  ]);
  const audience = (c: unknown) => (c as { name: string } | null)?.name ?? 'Only you';

  return (
    <main className="view">
      <div className="vh">
        <div><h1 className="title">Write</h1><span className="sub">Lessons and problems for yourself or your class</span></div>
        <Link className="btn txt" href="/classes"><Users {...ic} />Classes</Link>
      </div>
      <div className="scroll"><div className="narrow">
        <nav className="makes" aria-label="Write something new">
          <Link className="card" href="/write/problem"><span className="tile"><Plus {...ic} /></span><span className="t">New problem</span><span className="sub">One question</span></Link>
          <Link className="card" href="/write/quiz"><span className="tile"><ListChecks {...ic} /></span><span className="t">New quiz</span><span className="sub">A set, scored</span></Link>
          <Link className="card" href="/write/lesson"><span className="tile"><BookOpen {...ic} /></span><span className="t">New lesson</span><span className="sub">Reading</span></Link>
        </nav>

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
          <h2 className="label">Your quizzes</h2>
          <div className="card rows">
            {quizzes?.length ? quizzes.map((z) => (
              <Link className="item" key={z.id} href={`/write/quiz?id=${z.id}`}>
                <span className="tile"><ListChecks {...ic} /></span>
                <span><span className="t">{z.title}</span><span className="sub">{z.question_ids.length} {z.question_ids.length === 1 ? 'problem' : 'problems'}, {z.minutes ? `${z.minutes} minutes` : 'no time limit'}, {audience(z.classes)}</span></span>
                <ChevronRight {...ic} className="chev" />
              </Link>
            )) : <p className="empty">No quizzes yet. A quiz is a set of problems taken like an exam, with a score at the end.</p>}
          </div>
        </section>

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
