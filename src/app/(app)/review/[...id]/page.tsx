import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, CircleCheck, Pencil } from 'lucide-react';
import { session } from '@/lib/supabase';
import { inline } from '@/lib/math';
import { problemTitle } from '@/lib/data';
import { ReportForm } from '@/components/report';
import { ic } from '@/components/ui';

// One problem with its answer and full solution, opened from the notebook or a set summary.
export default async function Review({ params }: PageProps<'/review/[...id]'>) {
  const id = (await params).id.map(decodeURIComponent).join('/');
  const { supabase, user } = await session();
  const { data: q } = await supabase.from('questions').select('id, title, body, choices, answer, hint, steps, figure, owner_id, topics(name)').eq('id', id).maybeSingle();
  if (!q) notFound();
  const topic = (q.topics as unknown as { name: string } | null)?.name;

  return (
    <main className="view">
      <div className="vh">
        <Link className="ib" href="/notebook" aria-label="Back to Notebook"><ChevronLeft {...ic} /></Link>
        <div className="mid"><h1 className="t" style={{ margin: 0, fontSize: 'inherit' }}>{problemTitle(q.id, q.title)}</h1><span className="sub">{topic}</span></div>
        {q.owner_id === user.id && <Link className="btn txt" href={`/write/problem?id=${encodeURIComponent(q.id)}`}><Pencil {...ic} />Edit</Link>}
      </div>
      <div className="scroll"><div className="narrow">
        <div className="q" dangerouslySetInnerHTML={{ __html: inline(q.body) }} />
        {q.figure && <div className="card figc fig" dangerouslySetInnerHTML={{ __html: q.figure }} />}
        <div className="opts">
          {(q.choices as { key: string; text: string }[]).map((c) => (
            <button key={c.key} disabled className={c.key === q.answer ? 'right' : undefined}>
              <i>{c.key}</i><span dangerouslySetInnerHTML={{ __html: inline(c.text) }} /><CircleCheck {...ic} className="st" />
              {c.key === q.answer && <span className="sr-only">, correct answer</span>}
            </button>
          ))}
        </div>
        <div className="hint"><b>Hint.</b> <span dangerouslySetInnerHTML={{ __html: inline(q.hint) }} /></div>
        <div className="grp">
          <h2 className="label">Solution</h2>
          <ol className="steps">{(q.steps as string[]).map((s, i) => <li key={i}><span dangerouslySetInnerHTML={{ __html: inline(s) }} /></li>)}</ol>
        </div>
        {q.owner_id !== user.id && <ReportForm questionId={q.id} />}
      </div></div>
    </main>
  );
}
