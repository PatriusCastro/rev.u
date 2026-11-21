import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { session } from '@/lib/supabase';
import { rich } from '@/lib/math';
import { startPractice } from '@/app/actions';
import { ic } from '@/components/ui';

export default async function Lesson({ params }: PageProps<'/lesson/[...id]'>) {
  const id = (await params).id.map(decodeURIComponent).join('/');
  const { supabase } = await session();
  const [{ data: topic }, { count }] = await Promise.all([
    supabase.from('topics').select('name, area, minutes, lesson').eq('id', id).maybeSingle(),
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('topic_id', id),
  ]);
  if (!topic) notFound();

  return (
    <main className="view">
      <div className="vh">
        <Link className="ib" href="/subjects" aria-label="Back to Subjects"><ChevronLeft {...ic} /></Link>
        <div className="mid"><span className="sub">{topic.area}, {topic.minutes} minutes</span></div>
      </div>
      <div className="scroll"><div className="narrow">
        <h1 className="title">{topic.name}</h1>
        <article className="prose" dangerouslySetInnerHTML={{ __html: rich(topic.lesson) }} />
        {count ? (
          <form action={startPractice.bind(null, id)}>
            <button className="btn pri full">Practise {Math.min(10, count)} problems<ArrowRight {...ic} className="mv" /></button>
          </form>
        ) : <p className="sub">Problems for this topic are on the way.</p>}
      </div></div>
    </main>
  );
}
