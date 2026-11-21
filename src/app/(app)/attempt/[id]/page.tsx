import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronRight, CircleCheck, CircleX, Minus } from 'lucide-react';
import { session } from '@/lib/supabase';
import { inline } from '@/lib/math';
import { daysBetween, dayOf } from '@/lib/schedule';
import { problemTitle } from '@/lib/data';
import { Problem } from '@/components/problem';
import { AreaIcon, ic } from '@/components/ui';

const PASS_MARK = 70; // unconfirmed: check against the PRC exam program

export default async function Attempt({ params, searchParams }: PageProps<'/attempt/[id]'>) {
  const [{ id }, { q: qParam }] = await Promise.all([params, searchParams]);
  const { supabase } = await session();
  const [{ data: attempt }, { data: answers }] = await Promise.all([
    supabase.from('attempts').select('id, mode, question_ids, minutes, started_at, finished_at, quizzes(title)').eq('id', id).maybeSingle(),
    supabase.from('answers').select('question_id, choice, correct').eq('attempt_id', id),
  ]);
  if (!attempt) notFound();

  const ids: string[] = attempt.question_ids;
  const answered = new Map((answers ?? []).map((a) => [a.question_id as string, a]));
  const mock = attempt.mode === 'mock';
  const quiz = (attempt.quizzes as unknown as { title: string } | null)?.title;
  // A quiz can have no time limit; a mock exam always has one.
  const deadline = mock && attempt.minutes ? Date.parse(attempt.started_at) + attempt.minutes * 60_000 : null;
  // Server component rendered once per request, so reading the clock here is safe.
  // eslint-disable-next-line react-hooks/purity
  const expired = deadline !== null && Date.now() > deadline;
  // Mock: any position the reviewer asks for; otherwise the first problem without an answer.
  const asked = Number(qParam);
  const firstOpen = ids.findIndex((q) => !answered.has(q));
  const index = mock && Number.isInteger(asked) && asked >= 0 && asked < ids.length ? asked : firstOpen === -1 && mock ? ids.length - 1 : firstOpen;
  const over = !!attempt.finished_at || expired || index === -1;

  if (!over) {
    const currentId = ids[index];
    const [{ data: q }, { data: rep }] = await Promise.all([
      supabase.from('questions').select('id, body, choices, hint, figure').eq('id', currentId).maybeSingle(),
      supabase.from('repeats').select('interval, cleared_at').eq('question_id', currentId).maybeSingle(),
    ]);
    if (!q) notFound();
    return (
      <Problem
        key={q.id} attemptId={attempt.id} mode={attempt.mode} index={index} count={ids.length}
        questionId={q.id} bodyHtml={inline(q.body)} figure={q.figure} hintHtml={inline(q.hint)}
        choices={(q.choices as { key: string; text: string }[]).map((c) => ({ key: c.key, html: inline(c.text) }))}
        stage={rep && !rep.cleared_at ? String(rep.interval) : null} deadline={deadline} label={quiz}
        saved={mock ? answered.get(q.id)?.choice ?? null : undefined}
        answered={mock ? ids.map((x) => answered.has(x)) : undefined}
      />
    );
  }

  // A mock that ran out of time while nobody had it open is finished now, so its mistakes reach the notebook.
  if (mock && !attempt.finished_at) await supabase.rpc('finish_attempt', { p_attempt: attempt.id });

  // Set summary: what moved forward and what comes back.
  const [{ data: reps }, { data: qs }] = await Promise.all([
    supabase.from('repeats').select('question_id, due, cleared_at').in('question_id', ids),
    supabase.from('questions').select('id, title, topic_id, topics(name)').in('id', ids),
  ]);
  const repOf = new Map((reps ?? []).map((r) => [r.question_id, r]));
  const qOf = new Map((qs ?? []).map((q) => [q.id, q]));
  const right = ids.filter((x) => answered.get(x)?.correct).length;
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
        <h1 className="title">{mock ? `${score}%` : `${right} of ${ids.length} right`}</h1>
        <span className="sub">
          {quiz
            ? `${right} of ${ids.length} right in ${quiz}. Missed problems are in your notebook.`
            : mock
            ? `${right} of ${ids.length} right. The pass mark is ${PASS_MARK}% average, with no subject under 50%. Missed problems are in your notebook.`
            : right === ids.length ? 'Every one right. Nothing new goes into your notebook.' : 'The ones you missed are in your notebook and come back tomorrow.'}
        </span>
      </div></div>
      <div className="scroll"><div className="narrow">
        <div className="card rows">
          {ids.map((qid) => {
            const a = answered.get(qid);
            const q = qOf.get(qid);
            const tone = !a ? undefined : a.correct ? 'var(--color-green)' : 'var(--color-red)';
            return (
              <Link className="item" key={qid} href={`/review/${qid}`} style={{ gridTemplateColumns: '36px minmax(0, 1fr) auto 20px' }}>
                <span className={'tile' + (a && !a.correct ? ' w' : '')}>{q ? <AreaIcon topicId={q.topic_id} /> : null}</span>
                <span><span className="t">{problemTitle(qid, q?.title)}</span><span className="sub">{(q?.topics as unknown as { name: string } | null)?.name}</span></span>
                <span className="stage" style={{ color: tone }}>
                  {!a ? <Minus {...ic} /> : a.correct ? <CircleCheck {...ic} /> : <CircleX {...ic} />}{next(qid)}
                </span>
                <ChevronRight {...ic} className="chev" />
              </Link>
            );
          })}
        </div>
        <Link className="btn pri full" href="/">Back to Today<ArrowRight {...ic} className="mv" /></Link>
      </div></div>
    </main>
  );
}
