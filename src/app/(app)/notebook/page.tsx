import Link from 'next/link';
import { Repeat } from 'lucide-react';
import { session } from '@/lib/supabase';
import { problemTitle } from '@/lib/data';
import { dayOf, daysBetween } from '@/lib/schedule';
import { startRepeats } from '@/app/actions';
import { AreaIcon, StageDots, ic } from '@/components/ui';

const TABS = [
  { id: 'today', label: 'Due today', test: (d: number) => d <= 0 },
  { id: 'soon', label: 'In 1 to 3 days', test: (d: number) => d >= 1 && d <= 3 },
  { id: 'later', label: 'Later', test: (d: number) => d > 3 },
];

export default async function Notebook({ searchParams }: PageProps<'/notebook'>) {
  const { tab = 'today' } = await searchParams;
  const { supabase } = await session();
  const [{ data: open }, { count: cleared }] = await Promise.all([
    supabase.from('repeats').select('question_id, interval, due, misses, questions(topic_id, topics(area))').is('cleared_at', null).order('due'),
    supabase.from('repeats').select('question_id', { count: 'exact', head: true }).not('cleared_at', 'is', null),
  ]);
  const today = dayOf();
  const rows = (open ?? []).map((r) => ({ ...r, inDays: daysBetween(today, r.due), q: r.questions as unknown as { topic_id: string; topics: { area: string } } }));
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];
  const shown = rows.filter((r) => active.test(r.inDays));
  const dueNow = rows.filter((r) => r.inDays <= 0).length;

  return (
    <main className="view">
      <div className="vh"><div>
        <h1 className="title">Notebook</h1>
        <span className="sub">{rows.length} to clear, {cleared ?? 0} cleared so far</span>
      </div></div>
      <div className="scroll"><div className="narrow">
        <nav className="seg" aria-label="When they are due">
          {TABS.map((t) => (
            <Link key={t.id} href={`/notebook?tab=${t.id}`} aria-current={t.id === active.id ? 'page' : undefined}>
              {t.label} {rows.filter((r) => t.test(r.inDays)).length}
            </Link>
          ))}
        </nav>
        <div className="card rows">
          {shown.length ? shown.map((r) => (
            <div className="item" key={r.question_id}>
              <span className="tile w"><AreaIcon topicId={r.q.topic_id} /></span>
              <span><span className="t">{problemTitle(r.question_id)}</span><span className="sub">{r.q.topics.area}{r.misses > 1 ? `, missed ${r.misses === 2 ? 'twice' : `${r.misses} times`}` : ''}</span></span>
              <StageDots interval={r.interval} />
            </div>
          )) : (
            <p className="empty">{rows.length || cleared ? 'Nothing in this group.' : 'No mistakes yet. Problems you miss will collect here.'}</p>
          )}
        </div>
        {dueNow > 0 && (
          <form action={startRepeats}><button className="btn pri full"><Repeat {...ic} />Redo {dueNow} due {dueNow === 1 ? 'problem' : 'problems'}</button></form>
        )}
      </div></div>
    </main>
  );
}
