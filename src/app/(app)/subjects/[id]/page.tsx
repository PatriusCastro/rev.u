import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { session } from '@/lib/supabase';
import { topicStats } from '@/lib/data';
import { SubjectCard } from '@/components/subject-card';
import { ic } from '@/components/ui';

// One subject's topics; the Subjects list opens this on a phone, where all subjects at once is too long.
export default async function SubjectPage({ params }: PageProps<'/subjects/[id]'>) {
  const { id } = await params;
  const { supabase } = await session();
  const { topics, subjects, stats } = await topicStats(supabase);
  const subject = subjects.find((s) => s.id === id);
  if (!subject) notFound();
  const own = topics.filter((t) => t.subject_id === id);
  const started = own.filter((t) => stats.get(t.id)?.answered).length;

  return (
    <main className="view">
      <div className="vh">
        <Link className="ib" href="/subjects" aria-label="Back to Subjects"><ChevronLeft {...ic} /></Link>
        <div className="mid"><h1 className="t" style={{ margin: 0, fontSize: 'inherit' }}>{subject.name}</h1><span className="sub">{started} of {own.length} topics started</span></div>
      </div>
      <div className="scroll"><div className="narrow">
        <SubjectCard subject={subject} topics={topics} stats={stats} full />
      </div></div>
    </main>
  );
}
