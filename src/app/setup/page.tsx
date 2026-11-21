import { saveExamDate } from '@/app/actions';
import { session } from '@/lib/supabase';
import { addDays, dayOf } from '@/lib/schedule';

export default async function Setup({ searchParams }: PageProps<'/setup'>) {
  const { supabase } = await session();
  const [{ msg }, { data: profile }] = await Promise.all([searchParams, supabase.from('profiles').select('exam_date').single()]);
  return (
    <main className="pa" style={{ display: 'block' }}>
      <div className="scroll" style={{ alignItems: 'center', paddingTop: 64 }}>
        <div className="narrow" style={{ maxWidth: 420 }}>
          <div>
            <h1 className="title">When is your exam?</h1>
            <span className="sub">Rev.U spreads the problems you have left over the days until then.</span>
          </div>
          <form className="card form" action={saveExamDate}>
            <label className="field">Exam date<input name="exam_date" type="date" min={addDays(dayOf(), 1)} defaultValue={profile?.exam_date ?? ''} required /></label>
            {msg && <p className="err" role="alert" style={{ margin: 0 }}>{msg}</p>}
            <button className="btn pri full">Save exam date</button>
          </form>
        </div>
      </div>
    </main>
  );
}
