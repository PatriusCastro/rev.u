import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CircleCheck, CircleX, Minus } from 'lucide-react';
import { session } from '@/lib/supabase';
import { inline } from '@/lib/math';
import { daysBetween, dayOf } from '@/lib/schedule';
import { problemTitle } from '@/lib/data';
import { Problem } from '@/components/problem';
import { AreaIcon, ic } from '@/components/ui';

const PASS_MARK = 70; // unconfirmed: check against the PRC exam program

export default async function Attempt({ params }: PageProps<'/attempt/[id]'>) {
  const { id } = await params;
  const { supabase } = await session();
  const [{ data: attempt }, { data: answers }] = await Promise.all([
    supabase.from('attempts').select('id, mode, question_ids, minutes, started_at, finished_at').eq('id', id).maybeSingle(),
    supabase.from('answers').select('question_id, correct').eq('attempt_id', id),
  ]);
  if (!attempt) notFound();

  const answered = new Map((answers ?? []).map((a) => [a.question_id as string, a.correct as boolean]));
  const deadline = attempt.mode === 'mock' ? Date.parse(attempt.started_at) + attempt.minutes * 60_000 : null;
  const currentId = attempt.question_ids.find((q: string) => !answered.has(q));
  // Server component rendered once per request, so reading the clock here is safe.
  // eslint-disable-next-line react-hooks/purity
  const over = attempt.finished_at || !currentId || (deadline !== null && Date.now() > deadline);

  if (!over) {
    const [{ data: q }, { data: rep }] = await Promise.all([
      supabase.from('questions').select('id, body, choices, hint, figure').eq('id', currentId).single(),
      supabase.from('repeats').select('interval, cleared_at').eq('question_id', currentId).maybeSingle(),
    ]);
    if (!q) notFound();
    return (
      <Problem
        key={q.id} attemptId={attempt.id} mode={attempt.mode} index={answered.size} count={attempt.question_ids.length}
        questionId={q.id} bodyHtml={inline(q.body)} figure={q.figure} hintHtml={inline(q.hint)}
        choices={(q.choices as { key: string; text: string }[]).map((c) => ({ key: c.key, html: inline(c.text) }))}
        stage={rep && !rep.cleared_at ? String(rep.interval) : null} deadline={deadline}
      />
    );
  }

  // Set summary: what moved forward and what comes back.
  const ids: string[] = attempt.question_ids;
  const [{ data: reps }, { data: qs }] = await Promise.all([
    supabase.from('repeats').select('question_id, due, cleared_at').in('question_id', ids),
    supabase.from('questions').select('id, topic_id, topics(name)').in('id', ids),
  ]);
  const repOf = new Map((reps ?? []).map((r) => [r.question_id, r]));
  const topicOf = new Map((qs ?? []).map((q) => [q.id, q]));
  const right = [...answered.values()].filter(Boolean).length;
  const score = Math.round((100 * right) / ids.length);
  const today = dayOf();
  const next = (qid: string) => {
    if (!answered.has(qid)) return 'Not answered';
    const r = repOf.get(qid);
    if (!r) return 'Correct';
    if (r.cleared_at) return 'Cleared';
    const d = daysBetween(today, r.due);
    return d <= 0 ? 'Due today' : d === 1 ? 'Comes back tomorrow' : `Comes back in ${d} days`;
  };

  return (
    <main className="view">
      <div className="vh"><div>
        <h1 className="title">{attempt.mode === 'mock' ? `${score}%` : `${right} of ${ids.length} right`}</h1>
        <span className="sub">
          {attempt.mode === 'mock'
            ? `${right} of ${ids.length} right. The pass mark is ${PASS_MARK}% average, with no subject under 50%.`
            : right === ids.length ? 'Every one right. Nothing new goes into your notebook.' : 'The ones you missed are in your notebook and come back tomorrow.'}
        </span>
      </div></div>
      <div className="scroll"><div className="narrow">
        <div className="card rows">
          {ids.map((qid) => {
            const ok = answered.get(qid);
            const skipped = ok === undefined;
            const q = topicOf.get(qid);
            return (
              <div className="item" key={qid}>
                <span className={'tile' + (ok || skipped ? '' : ' w')}>{q ? <AreaIcon topicId={q.topic_id} /> : null}</span>
                <span><span className="t">{problemTitle(qid)}</span><span className="sub">{(q?.topics as unknown as { name: string } | null)?.name}</span></span>
                <span className="stage" style={{ color: skipped ? undefined : ok ? 'var(--color-green)' : 'var(--color-red)' }}>
                  {skipped ? <Minus {...ic} /> : ok ? <CircleCheck {...ic} /> : <CircleX {...ic} />}{next(qid)}
                </span>
              </div>
            );
          })}
        </div>
        <Link className="btn pri full" href="/">Back to Today<ArrowRight {...ic} className="mv" /></Link>
      </div></div>
    </main>
  );
}
