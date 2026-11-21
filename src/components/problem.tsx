'use client';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, ChevronLeft, CircleCheck, CircleX, Clock, Lightbulb, Repeat } from 'lucide-react';
import { submitAnswer, finishAttempt, type AnswerResult } from '@/app/actions';
import { ScratchPad } from './scratch-pad';
import { ScheduleTracker, ic } from './ui';

export type ProblemProps = {
  attemptId: string; mode: 'practice' | 'repeat' | 'mock'; index: number; count: number;
  questionId: string; bodyHtml: string; figure: string | null; choices: { key: string; html: string }[];
  hintHtml: string; stage: string | null; deadline: number | null;
};

const MODE_LABEL = { practice: 'Practice', repeat: 'Repeat', mock: 'Mock exam' };

export function Problem(p: ProblemProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<AnswerResult, { correct: boolean }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [shown, setShown] = useState(1);
  const mock = p.mode === 'mock';
  const last = p.index + 1 === p.count;

  const send = (choice: string) => start(async () => {
    const r = await submitAnswer(p.attemptId, p.questionId, choice);
    if ('error' in r) { setError(r.error); router.refresh(); return; }
    if (mock) { router.refresh(); return; }
    setResult(r);
  });
  const choose = (key: string) => { setPicked(key); if (!mock) send(key); };

  const state = (key: string) => !result ? '' : key === result.answer ? 'right' : key === picked ? 'wrong' : '';

  return (
    <main className="view">
      <div className="vh">
        <Link className="ib" href="/" aria-label="Back to Today"><ChevronLeft {...ic} /></Link>
        <div className="mid">
          <h1 className="t" style={{ margin: 0, fontSize: 'inherit' }}>{MODE_LABEL[p.mode]} {p.index + 1} of {p.count}</h1>
          <div className="segs" role="img" aria-label={`Problem ${p.index + 1} of ${p.count}`}>
            {Array.from({ length: p.count }, (_, i) => <i key={i} className={i < p.index ? 'd' : i === p.index ? 'c' : undefined} />)}
          </div>
        </div>
        {p.deadline ? <Timer attemptId={p.attemptId} deadline={p.deadline} />
          : p.mode === 'repeat' && p.stage ? <span className="pill"><Repeat {...ic} />{p.stage === '1' ? '1-day' : `${p.stage}-day`} repeat</span> : null}
      </div>
      <div className="solve">
        <div className="scroll">
          <div className="grp">
            <div className="q" dangerouslySetInnerHTML={{ __html: p.bodyHtml }} />
            {p.figure && <div className="card figc fig" dangerouslySetInnerHTML={{ __html: p.figure }} />}
          </div>
          <div className="grp">
            <div className="opts">
              {p.choices.map((c) => (
                <button key={c.key} className={state(c.key) || (pending && picked === c.key ? 'saving' : undefined)} disabled={!!result || pending} aria-busy={pending && picked === c.key} aria-pressed={mock ? picked === c.key : undefined} onClick={() => choose(c.key)}>
                  <i>{c.key}</i><span dangerouslySetInnerHTML={{ __html: c.html }} />
                  {state(c.key) === 'wrong' ? <CircleX {...ic} className="st" /> : <CircleCheck {...ic} className="st" />}
                  {state(c.key) && <span className="sr-only">{state(c.key) === 'right' ? ', correct answer' : ', your answer'}</span>}
                </button>
              ))}
            </div>
            {!mock && !result && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 16 }}>
                  <button className="btn txt" onClick={() => setHint(!hint)} aria-expanded={hint}><Lightbulb {...ic} />{hint ? 'Hide the hint' : 'Show a hint'}</button>
                  <button className="btn txt" disabled={pending} onClick={() => send('')}><BookOpen {...ic} />Show me how</button>
                </div>
                {hint && <div className="hint" dangerouslySetInnerHTML={{ __html: p.hintHtml }} />}
              </>
            )}
            {mock && <button className="btn pri full" disabled={!picked || pending} onClick={() => picked && send(picked)}>{last ? 'Save and finish' : 'Save and next'}<ArrowRight {...ic} className="mv" /></button>}
          </div>
          {error && <p className="err" role="alert">{error}</p>}
          {result && (
            // No pick means "Show me how": a calm amber note, not a red miss.
            <div className={'fb ' + (result.correct ? 'good' : picked ? 'bad' : 'how')} role="status">
              {result.correct ? <CircleCheck {...ic} /> : picked ? <CircleX {...ic} /> : <BookOpen {...ic} />}<span>{result.message}</span>
            </div>
          )}
          {!mock && <ScheduleTracker stage={result ? result.stage : p.stage} />}
          {result && (
            <div className="grp">
              <h2 className="label">Solution</h2>
              <ol className="steps">{result.steps.slice(0, shown).map((s, i) => <li key={i}><span dangerouslySetInnerHTML={{ __html: s }} /></li>)}</ol>
              <button className="btn pri full" disabled={shown >= result.steps.length} onClick={() => setShown(shown + 1)}>
                {shown >= result.steps.length ? 'All steps shown' : 'Show next step'}
              </button>
              <button className="btn txt" onClick={() => router.refresh()}>{last ? 'See how the set went' : 'Next problem'}<ArrowRight {...ic} className="mv" /></button>
            </div>
          )}
        </div>
        <ScratchPad problemHtml={p.bodyHtml} figure={p.figure} />
      </div>
    </main>
  );
}

function Timer({ attemptId, deadline }: { attemptId: string; deadline: number }) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, deadline - now);
  useEffect(() => {
    if (left === 0) finishAttempt(attemptId).then(() => router.refresh());
  }, [left, attemptId, router]);
  const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
  return <span className="pill timer" role="timer" aria-label={`${m} minutes left`}><Clock {...ic} />{m}:{String(s).padStart(2, '0')}</span>;
}
