import { signIn, signUp } from '@/app/actions';

export default async function Login({ searchParams }: PageProps<'/login'>) {
  const { msg } = await searchParams;
  return (
    <main className="pa" style={{ display: 'block' }}>
      <div className="scroll" style={{ alignItems: 'center', paddingTop: 64 }}>
        <div className="narrow" style={{ maxWidth: 420 }}>
          <div>
            <h1 className="title">Rev.U</h1>
            <span className="sub">Review for the Civil Engineering board exam, one day at a time.</span>
          </div>
          <form className="card form">
            <label className="field">Email<input name="email" type="email" autoComplete="email" required /></label>
            <label className="field">Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
            {msg && <p className="sub" role="status" style={{ margin: 0 }}>{msg}</p>}
            <button className="btn pri full" formAction={signIn}>Sign in</button>
            <button className="btn txt" formAction={signUp} style={{ alignSelf: 'center' }}>Create an account</button>
          </form>
        </div>
      </div>
    </main>
  );
}
