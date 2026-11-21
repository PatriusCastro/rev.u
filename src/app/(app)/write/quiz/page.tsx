import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { session } from '@/lib/supabase';
import { problemTitle } from '@/lib/data';
import { deleteQuiz, type QuizInput } from '@/app/actions';
import { QuizEditor } from '@/components/editor';
import { Submit } from '@/components/submit';
import { ic } from '@/components/ui';

export default async function WriteQuiz({ searchParams }: PageProps<'/write/quiz'>) {
  const { id } = await searchParams;
  const { supabase, user } = await session();
  const [{ data: questions }, { data: classes }, { data: quiz }] = await Promise.all([
    supabase.from('questions').select('id, title, class_id, topics(name)').eq('owner_id', user.id).order('id'),
    supabase.from('classes').select('id, name').eq('owner_id', user.id).order('name'),
    typeof id === 'string'
      ? supabase.from('quizzes').select('id, title, class_id, minutes, question_ids').eq('id', id).eq('owner_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (id && !quiz) notFound();

  const initial: QuizInput = quiz
    ? { id: quiz.id, title: quiz.title, class_id: quiz.class_id ?? '', minutes: quiz.minutes ? String(quiz.minutes) : '', question_ids: quiz.question_ids }
    : { title: '', class_id: '', minutes: '', question_ids: [] };

  return (
    <main className="view">
      <div className="vh">
        <Link className="ib" href="/write" aria-label="Back to Write"><ChevronLeft {...ic} /></Link>
        <div className="mid"><h1 className="t" style={{ margin: 0, fontSize: 'inherit' }}>{quiz ? 'Edit quiz' : 'New quiz'}</h1><span className="sub">Taken like an exam: score and solutions at the end</span></div>
      </div>
      <div className="scroll"><div className="narrow">
        <QuizEditor initial={initial} classes={classes ?? []}
          problems={(questions ?? []).map((q) => ({ id: q.id, title: problemTitle(q.id, q.title), topic: (q.topics as unknown as { name: string } | null)?.name ?? '', class_id: q.class_id }))} />
        {quiz && (
          <form action={deleteQuiz.bind(null, quiz.id)}>
            <Submit className="btn txt" style={{ color: 'var(--color-red)' }} confirmText={`Delete the quiz "${quiz.title}"? Its problems are kept.`}><Trash2 {...ic} />Delete this quiz</Submit>
          </form>
        )}
      </div></div>
    </main>
  );
}
