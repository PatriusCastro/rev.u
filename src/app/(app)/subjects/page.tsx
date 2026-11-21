import Link from 'next/link';
import { Users } from 'lucide-react';
import { session } from '@/lib/supabase';
import { topicStats } from '@/lib/data';
import { SubjectCard } from '@/components/subject-card';
import { ic } from '@/components/ui';

export default async function Subjects() {
  const { supabase } = await session();
  const { topics, subjects, stats } = await topicStats(supabase);
  const started = [...stats.values()].filter((s) => s.answered > 0).length;

  return (
    <main className="view">
      <div className="vh">
        <div>
          <h1 className="title">Subjects</h1>
          <span className="sub">{started} of {topics.length} topics started</span>
        </div>
        <Link className="btn txt" href="/classes"><Users {...ic} />Classes</Link>
      </div>
      <div className="scroll"><div className="cards">
        {subjects.map((subject) => <SubjectCard key={subject.id} subject={subject} topics={topics} stats={stats} />)}
      </div></div>
    </main>
  );
}
