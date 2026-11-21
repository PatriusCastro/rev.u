import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronLeft, Pencil, Plus } from 'lucide-react';
import { Submit } from '@/components/submit';
import { session } from '@/lib/supabase';
import { rich } from '@/lib/math';
import { startPractice } from '@/app/actions';
import { ic } from '@/components/ui';

export default async function Lesson({ params }: PageProps<'/lesson/[...id]'>) {
  const id = (await params).id.map(decodeURIComponent).join('/');
  const { supabase, user } = await session();
  const [{ data: topic }, { count }] = await Promise.all([
    supabase.from('topics').select('name, area, minutes, lesson, owner_id').eq('id', id).maybeSingle(),
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('topic_id', id),
  ]);
  if (!topic) notFound();

  return (
    <main className="view">
      <div className="vh">
        <Link className="ib" href="/subjects" aria-label="Back to Subjects"><ChevronLeft {...ic} /></Link>
        <div className="mid"><span className="sub">{topic.area}, {topic.minutes} minutes</span></div>
        {topic.owner_id === user.id && <Link className="btn txt" href={`/write/lesson?id=${encodeURIComponent(id)}`}><Pencil {...ic} />Edit</Link>}
      </div>
      <div className="scroll"><div className="narrow">
        <h1 className="title">{topic.name}</h1>
        <article className="prose" dangerouslySetInnerHTML={{ __html: rich(topic.lesson) }} />
        {count ? (
          // Sticks to the bottom while reading, so practice is one tap away at any point in the lesson.
          <form className="dock" action={startPractice.bind(null, id)}>
            <Submit className="btn pri full" pendingText="Starting…">Practise {Math.min(10, count)} problems<ArrowRight {...ic} className="mv" /></Submit>
          </form>
        ) : <p className="sub">Problems for this topic are on the way.</p>}
        <Link className="btn txt" href={`/write/problem?topic=${encodeURIComponent(id)}`}><Plus {...ic} />Write a problem for this topic</Link>
      </div></div>
    </main>
  );
}
