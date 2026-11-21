import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="pa" style={{ display: 'block' }}>
      <div className="scroll" style={{ alignItems: 'center', paddingTop: 96 }}>
        <div className="narrow" style={{ maxWidth: 420 }}>
          <div>
            <h1 className="title">Nothing here</h1>
            <span className="sub">This link points to a page that does not exist, or to something that belongs to another account.</span>
          </div>
          <Link className="btn pri full" href="/">Back to Today</Link>
        </div>
      </div>
    </main>
  );
}
