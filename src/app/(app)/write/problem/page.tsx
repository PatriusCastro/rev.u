import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { session } from '@/lib/supabase';
import { deleteContent, type ProblemInput } from '@/app/actions';
import { ProblemEditor } from '@/components/editor';
import { ic } from '@/components/ui';

export default async function WriteProblem({ searchParams }: PageProps<'/write/problem'>) {
  const { id, topic } = await searchParams;
  const { supabase, user } = await session();
  const [{ data: topics }, { data: classes }, { data: q }] = await Promise.all([
    // Built-in topics and your own; row rules would also show class topics you cannot add to.
    supabase.from('topics').select('id, name, owner_id, class_id').or(`owner_id.is.null,owner_id.eq.${user.id}`).order('sort'),
    supabase.from('classes').select('id, name').eq('owner_id', user.id).order('name'),
    typeof id === 'string'
      ? supabase.from('questions').select('id, topic_id, class_id, title, body, choices, answer, hint, steps').eq('id', id).eq('owner_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (id && !q) notFound();

  const initial: ProblemInput = q
    ? { id: q.id, topic_id: q.topic_id, class_id: q.class_id ?? '', title: q.title ?? '', body: q.body, choices: q.choices, answer: q.answer, hint: q.hint, steps: q.steps }
    : { topic_id: typeof topic === 'string' ? topic : '', class_id: '', title: '', body: '', choices: [], answer: 'A', hint: '', steps: [''] };

  return (
    <main className="view">
      <div className="vh">
        <Link className="ib" href="/write" aria-label="Back to Write"><ChevronLeft {...ic} /></Link>
        <div className="mid"><h1 className="t" style={{ margin: 0, fontSize: 'inherit' }}>{q ? 'Edit problem' : 'New problem'}</h1></div>
      </div>
      <div className="scroll"><div className="narrow">
        <ProblemEditor initial={initial} classes={classes ?? []}
          topics={(topics ?? []).map((t) => ({ id: t.id, name: t.name, own: t.owner_id === user.id, class_id: t.class_id }))} />
        {q && (
          <form action={deleteContent.bind(null, 'questions', q.id)}>
            <button className="btn txt" style={{ color: 'var(--color-red)' }}><Trash2 {...ic} />Delete this problem</button>
          </form>
        )}
      </div></div>
    </main>
  );
}
