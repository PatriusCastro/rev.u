import Link from 'next/link';
import { ChevronRight, ListChecks, Users } from 'lucide-react';
import { session } from '@/lib/supabase';
import { topicStats } from '@/lib/data';
import { startQuiz } from '@/app/actions';
import { Submit } from '@/components/submit';
import { SubjectCard } from '@/components/subject-card';
import { ic } from '@/components/ui';

export default async function Subjects() {
  const { supabase, user } = await session();
  const [{ topics, subjects, stats }, { data: quizzes }] = await Promise.all([
    topicStats(supabase),
    // Row rules return your own quizzes and those of classes you are in.
    supabase.from('quizzes').select('id, title, minutes, question_ids, owner_id, classes(name)').neq('question_ids', '{}').order('created_at', { ascending: false }),
  ]);
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
      <div className="scroll">
        {!!quizzes?.length && (
          <section className="grp" style={{ maxWidth: 640 }}>
            <h2 className="label">Quizzes</h2>
            <div className="card rows">
              {quizzes.map((z) => (
                <form key={z.id} action={startQuiz.bind(null, z.id)}>
                  <Submit className="item" pendingText="Starting…">
                    <span className="tile"><ListChecks {...ic} /></span>
                    <span><span className="t">{z.title}</span><span className="sub">{z.question_ids.length} {z.question_ids.length === 1 ? 'problem' : 'problems'}, {z.minutes ? `${z.minutes} minutes` : 'no time limit'}, {z.owner_id === user.id ? 'yours' : (z.classes as unknown as { name: string } | null)?.name}</span></span>
                    <ChevronRight {...ic} className="chev" />
                  </Submit>
                </form>
              ))}
            </div>
          </section>
        )}
        <div className="cards">
          {subjects.map((subject) => <SubjectCard key={subject.id} subject={subject} topics={topics} stats={stats} />)}
        </div>
      </div>
    </main>
  );
}
