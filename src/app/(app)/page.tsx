import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, BookOpen, ChevronRight, CircleCheck, Clock, Flame } from 'lucide-react';
import { Submit } from '@/components/submit';
import { session } from '@/lib/supabase';
import { topicStats } from '@/lib/data';
import { rankTopics, dailyTarget, streak, weekDays, MIN_ANSWERS } from '@/lib/plan';
import { dayOf, addDays, daysBetween } from '@/lib/schedule';
import { signOut, startPractice, startRepeats } from '@/app/actions';
import { AreaIcon, Ring, ic } from '@/components/ui';

const MINUTES_PER_PROBLEM = 2;
const AGE_LABEL: Record<number, string> = { 1: 'from yesterday', 3: 'from 3 days ago', 7: 'from 7 days ago' };

export default async function Today() {
  const { supabase } = await session();
  const today = dayOf();
  const [{ data: profile }, { data: due }, { data: recent }, { data: open }, data] = await Promise.all([
    supabase.from('profiles').select('exam_date').single(),
    supabase.from('repeats').select('interval').is('cleared_at', null).lte('due', today),
    supabase.from('daily_answers').select('day, answered').gte('day', addDays(today, -400)),
    supabase.from('attempts').select('id, question_ids, answers(count)').eq('mode', 'repeat').is('finished_at', null).gte('started_at', `${today}T00:00:00+08:00`).order('started_at', { ascending: false }).limit(1),
    topicStats(supabase),
  ]);
  if (!profile?.exam_date) redirect('/setup');

  const daysLeft = Math.max(0, daysBetween(today, profile.exam_date));
  const perDay = new Map<string, number>();
  for (const r of recent ?? []) perDay.set(r.day, r.answered);
  const doneToday = perDay.get(today) ?? 0;
  const unseen = [...data.stats.values()].reduce((n, s) => n + s.unseen, 0);
  const target = Math.max(doneToday, dailyTarget(unseen, daysLeft) + (due?.length ?? 0));
  const days = weekDays(today, addDays);
  const counts = days.map((d) => perDay.get(d) ?? 0);
  const top = Math.max(1, target, ...counts);
  const run = streak(new Set(perDay.keys()), today, addDays);

  // Repeats card: a started set continues, otherwise a new set starts.
  const cont = open?.[0] && open[0].question_ids.length - (open[0].answers as unknown as { count: number }[])[0].count;
  const dueCount = cont || due?.length || 0;
  const ages = [1, 3, 7].map((i) => (due ?? []).filter((r) => r.interval === i).length);

  const ranked = rankTopics([...data.stats.values()]).filter((s) => s.unseen > 0 || s.answered > 0);
  const byId = new Map(data.topics.map((t) => [t.id, t]));
  const practise = ranked[0] && byId.get(ranked[0].id);
  const lesson = byId.get((ranked[1] ?? ranked[0])?.id ?? '');
  const total = dueCount ? 3 : 2;
  const offset = dueCount ? 1 : 0;
  // Today's target met and nothing due: say so, and make further practice optional rather than the main action.
  const done = !dueCount && doneToday > 0 && doneToday >= target;
  const promote = !dueCount && !done;

  return (
    <main className="view">
      <div className="vh">
        <div>
          <h1 className="title">Today</h1>
          <span className="sub">{new Intl.DateTimeFormat('en-PH', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Manila' }).format(new Date())}</span>
        </div>
        {run > 0 && <span className="pill"><Flame {...ic} />{run} {run === 1 ? 'day' : 'days'}</span>}
      </div>
      <div className="scroll"><div className="cols">
        <div className="grp" style={{ gap: 20 }}>
          {dueCount ? (
            <section className="hero" aria-label="Repeats">
              <div className="hrow"><span className="hchip">Stop 1 of {total}</span><span className="htime"><Clock {...ic} />About {dueCount * MINUTES_PER_PROBLEM} minutes</span></div>
              <div>
                <span className="htitle">{cont ? `${dueCount} ${dueCount === 1 ? 'repeat' : 'repeats'} left` : `${dueCount} ${dueCount === 1 ? 'repeat' : 'repeats'} due`}</span>
                <span className="hsub">Problems you missed before. Each one you get right moves a step closer to cleared.</span>
              </div>
              {!cont && <div className="ages">{ages.map((n, i) => <div key={i}><b>{n}</b>{AGE_LABEL[[1, 3, 7][i]]}</div>)}</div>}
              {cont
                ? <Link className="btn inv full" href={`/attempt/${open![0].id}`}>Continue repeats<ArrowRight {...ic} className="mv" /></Link>
                : <form action={startRepeats}><Submit className="btn inv full" pendingText="Starting…">Start repeats<ArrowRight {...ic} className="mv" /></Submit></form>}
            </section>
          ) : done ? (
            <div className="card item"><span className="tile"><CircleCheck {...ic} /></span><span><span className="t">Done for today</span><span className="sub">You worked {doneToday} {doneToday === 1 ? 'problem' : 'problems'}. Anything more is extra.</span></span><span /></div>
          ) : (
            <div className="card item"><span className="tile"><Clock {...ic} /></span><span><span className="t">No repeats due today</span><span className="sub">Problems you miss come back here on their day.</span></span><span /></div>
          )}

          <div className="grp">
            <h2 className="label">{dueCount ? 'Then' : done ? 'If you want more' : 'Your route today'}</h2>
            {practise ? (
              <div className="route">
                <div className="stop"><span className="node">{1 + offset}</span>
                  {/* With no repeats due, this stop becomes the screen's one main action. */}
                  <form action={startPractice.bind(null, practise.id)} className={promote ? 'card' : undefined}>
                    <Submit className={promote ? 'item' : 'card item'}>
                      <span className={'tile' + (ranked[0].answered >= MIN_ANSWERS && ranked[0].correct / ranked[0].answered < 0.5 ? ' w' : '')}><AreaIcon topicId={practise.id} /></span>
                      <span><span className="t">{practise.name}</span><span className="sub">Practise {Math.min(10, data.stats.get(practise.id)!.total)}, {ranked[0].answered < MIN_ANSWERS ? 'a topic you have barely started' : 'your weakest topic'}</span></span>
                      <ChevronRight {...ic} className="chev" />
                    </Submit>
                    {promote && <div style={{ padding: '0 12px 12px' }}><Submit className="btn pri full" pendingText="Starting…">Start practice<ArrowRight {...ic} className="mv" /></Submit></div>}
                  </form>
                </div>
                {lesson && (
                  <div className="stop"><span className="node">{2 + offset}</span>
                    <Link className="card item" href={`/lesson/${lesson.id}`}>
                      <span className="tile"><BookOpen {...ic} /></span>
                      <span><span className="t">{lesson.name}</span><span className="sub">Lesson, {lesson.minutes} minutes</span></span>
                      <ChevronRight {...ic} className="chev" />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="card empty">No topics yet. Once lessons are imported, your route appears here.</div>
            )}
          </div>
        </div>

        <div className="grp" style={{ gap: 20 }}>
          <div className="bento">
            <div className="card"><Ring value={doneToday / target} label={`${Math.round((100 * doneToday) / Math.max(1, target))}%`} /><div><span className="t">{doneToday} of {target}</span><span className="sub">problems today</span></div></div>
            <div className="card"><div className="num">{daysLeft}</div><div><span className="t">{daysLeft === 1 ? 'day' : 'days'}</span><span className="sub">to the exam</span></div></div>
          </div>
          <div className="card wk">
            <h2 className="label">Problems solved this week</h2>
            <div className="bars" role="img" aria-label={`Problems solved each day this week: ${counts.slice(0, days.indexOf(today) + 1).join(', ')} so far today`}>
              {counts.map((c, i) => <i key={i} className={days[i] === today ? 'n' : undefined} style={{ height: `${(100 * c) / top}%` }} />)}
            </div>
            <div className="days" aria-hidden>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}</div>
          </div>
          <form action={signOut} style={{ display: 'flex', gap: 16 }}>
            <Link className="btn txt" href="/setup">Change exam date</Link>
            <button className="btn txt">Sign out</button>
          </form>
        </div>
      </div></div>
    </main>
  );
}
