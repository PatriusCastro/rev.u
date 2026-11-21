import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { session } from '@/lib/supabase';
import { deleteContent, type TopicInput } from '@/app/actions';
import { LessonEditor } from '@/components/editor';
import { ic } from '@/components/ui';

export default async function WriteLesson({ searchParams }: PageProps<'/write/lesson'>) {
  const { id } = await searchParams;
  const { supabase, user } = await session();
  const [{ data: subjects }, { data: classes }, { data: t }] = await Promise.all([
    supabase.from('subjects').select('id, name').order('sort'),
    supabase.from('classes').select('id, name').eq('owner_id', user.id).order('name'),
    typeof id === 'string'
      ? supabase.from('topics').select('id, subject_id, class_id, area, name, minutes, lesson').eq('id', id).eq('owner_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (id && !t) notFound();

  const initial: TopicInput = t
    ? { ...t, class_id: t.class_id ?? '' }
    : { subject_id: subjects?.[0]?.id ?? '', class_id: '', area: '', name: '', minutes: 8, lesson: '' };

  return (
    <main className="view">
      <div className="vh">
        <Link className="ib" href="/write" aria-label="Back to Write"><ChevronLeft {...ic} /></Link>
        <div className="mid"><h1 className="t" style={{ margin: 0, fontSize: 'inherit' }}>{t ? 'Edit lesson' : 'New lesson'}</h1></div>
      </div>
      <div className="scroll"><div className="narrow">
        <LessonEditor initial={initial} subjects={subjects ?? []} classes={classes ?? []} />
        {t && (
          <form action={deleteContent.bind(null, 'topics', t.id)}>
            <button className="btn txt" style={{ color: 'var(--color-red)' }}><Trash2 {...ic} />Delete this lesson and its problems</button>
          </form>
        )}
      </div></div>
    </main>
  );
}
