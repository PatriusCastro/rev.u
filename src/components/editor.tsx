'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { saveProblem, saveTopic, type ProblemInput, type TopicInput } from '@/app/actions';
import { ic } from './ui';

type Option = { id: string; name: string };
type TopicOption = Option & { own: boolean; class_id: string | null };

const MATH_TIP = 'Write math between dollar signs, for example $\\tan 30^\\circ$. Use **bold** for emphasis.';
const KEYS = ['A', 'B', 'C', 'D'];

function useSave<T>(save: (v: T) => Promise<{ error: string } | { id: string }>, done: (id: string) => string) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const submit = (v: T) => start(async () => {
    const r = await save(v);
    if ('error' in r) return setError(r.error);
    router.push(done(r.id));
  });
  return { error, pending, submit };
}

export function ProblemEditor({ initial, topics, classes }: { initial: ProblemInput; topics: TopicOption[]; classes: Option[] }) {
  const [v, setV] = useState(initial);
  const { error, pending, submit } = useSave(saveProblem, (id) => `/review/${id}`);
  const set = (patch: Partial<ProblemInput>) => setV({ ...v, ...patch });
  const topic = topics.find((t) => t.id === v.topic_id);
  // A problem under your own lesson always shares that lesson's audience.
  const classId = topic?.own ? topic.class_id ?? '' : v.class_id;

  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); submit({ ...v, class_id: classId }); }}>
      <label className="field">Topic
        <select value={v.topic_id} required onChange={(e) => set({ topic_id: e.target.value })}>
          <option value="" disabled>Choose a topic</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.name}{t.own ? ' (yours)' : ''}</option>)}
        </select>
      </label>
      <label className="field">Who sees it
        <select value={classId} disabled={topic?.own} onChange={(e) => set({ class_id: e.target.value })}>
          <option value="">Only me</option>
          {classes.map((c) => <option key={c.id} value={c.id}>Class: {c.name}</option>)}
        </select>
        {topic?.own && <span className="sub tip">Set by the lesson this problem belongs to.</span>}
      </label>
      <label className="field">Title<input value={v.title} maxLength={120} onChange={(e) => set({ title: e.target.value })} placeholder="Short name, for example: Tower from two points" /></label>
      <label className="field">Problem
        <textarea rows={4} required maxLength={4000} value={v.body} onChange={(e) => set({ body: e.target.value })} />
        <span className="sub tip">{MATH_TIP}</span>
      </label>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ marginBottom: 6 }}>Choices. Pick the correct one.</legend>
        {KEYS.map((k, i) => (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr)', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <label style={{ display: 'grid', placeItems: 'center', minHeight: 44 }}>
              <input type="radio" name="answer" checked={v.answer === k} onChange={() => set({ answer: k })} aria-label={`${k} is correct`} />
            </label>
            <input aria-label={`Choice ${k}`} maxLength={300} placeholder={i < 2 ? `Choice ${k}` : `Choice ${k} (optional)`} value={v.choices[i]?.text ?? ''}
              onChange={(e) => set({ choices: KEYS.map((key, j) => ({ key, text: j === i ? e.target.value : v.choices[j]?.text ?? '' })) })} />
          </div>
        ))}
      </fieldset>
      <label className="field">Hint<textarea rows={2} required maxLength={1000} value={v.hint} onChange={(e) => set({ hint: e.target.value })} placeholder="A nudge, not the answer" /></label>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ marginBottom: 6 }}>Solution steps</legend>
        {v.steps.map((s, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 44px', gap: 8, marginBottom: 8 }}>
            <textarea aria-label={`Step ${i + 1}`} rows={2} maxLength={2000} value={s} onChange={(e) => set({ steps: v.steps.map((x, j) => (j === i ? e.target.value : x)) })} />
            <button type="button" className="ib" aria-label={`Remove step ${i + 1}`} disabled={v.steps.length === 1} onClick={() => set({ steps: v.steps.filter((_, j) => j !== i) })}><Trash2 {...ic} /></button>
          </div>
        ))}
        <button type="button" className="btn txt" disabled={v.steps.length >= 20} onClick={() => set({ steps: [...v.steps, ''] })}><Plus {...ic} />Add a step</button>
      </fieldset>
      {error && <p className="err" role="alert" style={{ margin: 0 }}>{error}</p>}
      <button className="btn pri full" disabled={pending} aria-busy={pending}>{pending ? 'Saving…' : 'Save problem'}</button>
    </form>
  );
}

export function LessonEditor({ initial, subjects, classes }: { initial: TopicInput; subjects: Option[]; classes: Option[] }) {
  const [v, setV] = useState(initial);
  const { error, pending, submit } = useSave(saveTopic, (id) => `/lesson/${id}`);
  const set = (patch: Partial<TopicInput>) => setV({ ...v, ...patch });

  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); submit(v); }}>
      <label className="field">Subject
        <select value={v.subject_id} required onChange={(e) => set({ subject_id: e.target.value })}>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <label className="field">Who sees it
        <select value={v.class_id} onChange={(e) => set({ class_id: e.target.value })}>
          <option value="">Only me</option>
          {classes.map((c) => <option key={c.id} value={c.id}>Class: {c.name}</option>)}
        </select>
        {initial.id && <span className="sub tip">Problems under this lesson keep their own setting. Edit them too if you change this.</span>}
      </label>
      <label className="field">Area<input required maxLength={60} value={v.area} onChange={(e) => set({ area: e.target.value })} placeholder="For example: Trigonometry" /></label>
      <label className="field">Lesson name<input required maxLength={120} value={v.name} onChange={(e) => set({ name: e.target.value })} /></label>
      <label className="field">Minutes to read<input type="number" min={1} max={120} value={v.minutes} onChange={(e) => set({ minutes: Number(e.target.value) })} /></label>
      <label className="field">Lesson
        <textarea rows={14} required maxLength={20000} value={v.lesson} onChange={(e) => set({ lesson: e.target.value })} />
        <span className="sub tip">Start a heading with ## and a list item with -. Leave a blank line between paragraphs. {MATH_TIP} Put a formula on its own line between $$ and $$.</span>
      </label>
      {error && <p className="err" role="alert" style={{ margin: 0 }}>{error}</p>}
      <button className="btn pri full" disabled={pending} aria-busy={pending}>{pending ? 'Saving…' : 'Save lesson'}</button>
    </form>
  );
}
