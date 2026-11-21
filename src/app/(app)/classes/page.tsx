import Link from 'next/link';
import { ChevronLeft, Users } from 'lucide-react';
import { session } from '@/lib/supabase';
import { createClass, deleteClass, joinClass, leaveClass } from '@/app/actions';
import { Submit } from '@/components/submit';
import { ic } from '@/components/ui';

// Instructors make a class and share its code; students join with the code and see its lessons and problems.
export default async function Classes({ searchParams }: PageProps<'/classes'>) {
  const { msg } = await searchParams;
  const { supabase, user } = await session();
  const [{ data: classes }, { data: members }] = await Promise.all([
    supabase.from('classes').select('id, name, code, owner_id').order('name'),
    supabase.from('class_members').select('class_id'),
  ]);
  const own = (classes ?? []).filter((c) => c.owner_id === user.id);
  const joined = (classes ?? []).filter((c) => c.owner_id !== user.id);
  const size = (id: string) => (members ?? []).filter((m) => m.class_id === id).length;

  return (
    <main className="view">
      <div className="vh">
        <Link className="ib" href="/subjects" aria-label="Back to Subjects"><ChevronLeft {...ic} /></Link>
        <div className="mid"><h1 className="t" style={{ margin: 0, fontSize: 'inherit' }}>Classes</h1></div>
      </div>
      <div className="scroll">
        {msg && <p className="note" role="status">{msg}</p>}
        <div className="split even">

        <section className="grp">
          <h2 className="label">Join a class</h2>
          <form className="card form" action={joinClass}>
            <label className="field">Class code<input name="code" required maxLength={6} autoCapitalize="characters" autoComplete="off" placeholder="6 letters and numbers, from your instructor" /></label>
            <Submit className="btn pri full" pendingText="Joining…">Join class</Submit>
          </form>
          {joined.length > 0 && (
            <div className="card rows">
              {joined.map((c) => (
                <div className="item" key={c.id}>
                  <span className="tile"><Users {...ic} /></span>
                  <span className="t">{c.name}</span>
                  <form action={leaveClass.bind(null, c.id)}><button className="btn txt">Leave</button></form>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grp">
          <h2 className="label">Teach a class</h2>
          <p className="sub" style={{ margin: 0 }}>Share the code with your students. When you write a lesson or problem, choose the class under Who sees it.</p>
          {own.length > 0 && (
            <div className="card rows">
              {own.map((c) => (
                <div className="item" key={c.id}>
                  <span className="tile"><Users {...ic} /></span>
                  <span><span className="t">{c.name}</span><span className="sub">Code <b style={{ letterSpacing: 1, color: 'var(--color-ink)' }}>{c.code}</b>, {size(c.id)} {size(c.id) === 1 ? 'student' : 'students'}</span></span>
                  <form action={deleteClass.bind(null, c.id)}><Submit className="btn txt" style={{ color: 'var(--color-red)' }} aria-label={`Delete class ${c.name}`} confirmText={`Delete ${c.name}? Students lose its lessons and problems.`}>Delete</Submit></form>
                </div>
              ))}
            </div>
          )}
          <form className="card form" action={createClass}>
            <label className="field">Class name<input name="name" required maxLength={80} placeholder="For example: CE Review, Batch 2027" /></label>
            <Submit className="btn sec full" pendingText="Creating…">Create class</Submit>
          </form>
        </section>
      </div></div>
    </main>
  );
}
