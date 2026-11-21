import Link from 'next/link';
import { ChevronRight, Timer } from 'lucide-react';
import { Submit } from './submit';
import { MIN_ANSWERS } from '@/lib/plan';
import { startMock } from '@/app/actions';
import { AreaIcon, Ring, ic, pct } from './ui';
import type { topicStats } from '@/lib/data';

type Data = Awaited<ReturnType<typeof topicStats>>;

/** A subject's progress, mock exam button and topics. On a phone the Subjects list shows only the
 *  header, which opens the subject's own page; `full` is that page, where the header is in the view title. */
export function SubjectCard({ subject, topics, stats, full }: { subject: Data['subjects'][number]; topics: Data['topics']; stats: Data['stats']; full?: boolean }) {
  const own = topics.filter((t) => t.subject_id === subject.id);
  const tally = own.reduce((a, t) => { const s = stats.get(t.id); return { answered: a.answered + (s?.answered ?? 0), correct: a.correct + (s?.correct ?? 0) }; }, { answered: 0, correct: 0 });
  const started = own.filter((t) => stats.get(t.id)?.answered).length;
  return (
    <section className={'card' + (full ? '' : ' subjcard')} aria-label={subject.name}>
      {!full && (
        <Link className="subj" href={`/subjects/${subject.id}`}>
          <Ring value={tally.answered ? tally.correct / tally.answered : 0} label={tally.answered ? `${pct(tally.correct, tally.answered)}%` : '–'} />
          <span><span className="t">{subject.name}</span><span className="sub">{own.length ? `${started} of ${own.length} topics started` : 'No topics yet'}</span></span>
          <ChevronRight {...ic} className="chev" />
        </Link>
      )}
      {/* Above the topics, so it is not lost under a long list. */}
      {own.length > 0 && (
        <form className={full ? 'foot top' : 'foot'} action={startMock.bind(null, subject.id)}>
          <Submit className="btn txt" pendingText="Starting…"><Timer {...ic} />Take a mock exam</Submit>
          <span className="sub">{subject.mock_items} problems, {subject.mock_minutes} minutes</span>
        </form>
      )}
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
              {s.answered > 0 && <span className="bar"><i style={{ width: `${p}%` }} /></span>}
            </span>
            <b>{s.answered ? `${p}%` : ''}</b>
          </Link>
        );
      })}
    </section>
  );
}
