import Link from 'next/link';
import { Timer } from 'lucide-react';
import { session } from '@/lib/supabase';
import { topicStats } from '@/lib/data';
import { MIN_ANSWERS } from '@/lib/plan';
import { startMock } from '@/app/actions';
import { AreaIcon, Ring, ic, pct } from '@/components/ui';

export default async function Subjects() {
  const { supabase } = await session();
  const { topics, subjects, stats } = await topicStats(supabase);
  const started = [...stats.values()].filter((s) => s.answered > 0).length;

  return (
    <main className="view">
      <div className="vh"><div>
        <h1 className="title">Subjects</h1>
        <span className="sub">{started} of {topics.length} topics started</span>
      </div></div>
      <div className="scroll"><div className="cards">
        {subjects.map((subject) => {
          const own = topics.filter((t) => t.subject_id === subject.id);
          const tally = own.reduce((a, t) => { const s = stats.get(t.id); return { answered: a.answered + (s?.answered ?? 0), correct: a.correct + (s?.correct ?? 0) }; }, { answered: 0, correct: 0 });
          return (
            <section className="card" key={subject.id} aria-label={subject.name}>
              <div className="subj">
                <Ring value={tally.answered ? tally.correct / tally.answered : 0} label={tally.answered ? `${pct(tally.correct, tally.answered)}%` : '–'} />
                <span><span className="t">{subject.name}</span><span className="sub">{own.length ? `${own.filter((t) => stats.get(t.id)?.answered).length} of ${own.length} topics started` : 'No topics yet'}</span></span>
              </div>
              {own.map((t) => {
                const s = stats.get(t.id)!;
                const p = pct(s.correct, s.answered);
                const weak = s.answered >= MIN_ANSWERS && p < 50;
                return (
                  <Link className={'topic' + (weak ? ' w' : '')} key={t.id} href={`/lesson/${t.id}`}>
                    <AreaIcon topicId={t.id} />
                    <span>
                      <span className="t">{t.name}</span>
                      <span className="sub">{t.area}{s.answered ? `, ${s.answered} answered` : ', not started'}{weak ? ', weak topic' : ''}</span>
                      <span className="bar"><i style={{ width: `${p}%` }} /></span>
                    </span>
                    <b>{s.answered ? `${p}%` : ''}</b>
                  </Link>
                );
              })}
              {own.length > 0 && (
                <form className="foot" action={startMock.bind(null, subject.id)}>
                  <button className="btn txt"><Timer {...ic} />Take a mock exam</button>
                </form>
              )}
            </section>
          );
        })}
      </div></div>
    </main>
  );
}
