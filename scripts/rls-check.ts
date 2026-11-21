// Phase 1 check: one user cannot read or write another user's rows or files.
// Creates two throwaway users, so run it against a local or staging project, not production.
// Usage: npm run check:rls   (needs NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and imported content)
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
assert.ok(url && key, 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');

async function user(name: string) {
  const c = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await c.auth.signUp({ email: `rls-${name}-${Date.now()}@example.com`, password: 'check-password-123' });
  assert.ok(!error && data.session, `sign-up failed (turn off email confirmation locally): ${error?.message}`);
  return { c, id: data.user!.id };
}

const a = await user('a'), b = await user('b');
const { data: q } = await a.c.from('questions').select('id').limit(1).single();
assert.ok(q, 'import content first (npm run import)');

// A writes one row in every owner-only table, and a PDF.
const { data: att, error: e1 } = await a.c.from('attempts').insert({ mode: 'practice', question_ids: [q.id] }).select('id').single();
assert.ifError(e1);
assert.ifError((await a.c.from('answers').insert({ attempt_id: att!.id, question_id: q.id, choice: 'A', correct: false })).error);
assert.ifError((await a.c.from('repeats').insert({ question_id: q.id, interval: 1, due: '2030-01-01' })).error);
const pdf = new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' });
assert.ifError((await a.c.storage.from('library').upload(`${a.id}/x.pdf`, pdf, { contentType: 'application/pdf' })).error);
assert.ifError((await a.c.from('documents').insert({ path: `${a.id}/x.pdf`, title: 'x', size: 14 })).error);

// B sees none of it.
for (const t of ['profiles', 'attempts', 'answers', 'repeats', 'documents', 'topic_progress', 'daily_answers']) {
  const { data } = await b.c.from(t).select('*');
  const leaked = (data ?? []).filter((r) => (r.user_id ?? r.id) === a.id || (t === 'topic_progress' && r.answered > 0) || t === 'daily_answers');
  assert.equal(leaked.length, 0, `${t}: user B can read user A's rows`);
}
// B cannot write into A's data or files.
assert.ok((await b.c.from('answers').insert({ attempt_id: att!.id, question_id: q.id, choice: 'B', correct: true })).error, 'B answered inside A’s attempt');
assert.ok((await b.c.from('attempts').insert({ user_id: a.id, mode: 'practice', question_ids: [q.id] })).error, 'B created an attempt as A');
const { data: upd } = await b.c.from('repeats').update({ interval: 7 }).eq('question_id', q.id).select();
assert.equal(upd?.length ?? 0, 0, 'B updated A’s repeat');
assert.ok((await b.c.storage.from('library').download(`${a.id}/x.pdf`)).error, 'B downloaded A’s PDF');
assert.ok((await b.c.storage.from('library').upload(`${a.id}/y.pdf`, pdf, { contentType: 'application/pdf' })).error, 'B uploaded into A’s folder');
// The bucket refuses non-PDFs and oversized files.
assert.ok((await b.c.storage.from('library').upload(`${b.id}/n.txt`, new Blob(['hi'], { type: 'text/plain' }), { contentType: 'text/plain' })).error, 'a text file was accepted');
const big = new Blob([new Uint8Array(21 * 1024 * 1024)], { type: 'application/pdf' });
assert.ok((await b.c.storage.from('library').upload(`${b.id}/big.pdf`, big, { contentType: 'application/pdf' })).error, 'a 21 MB file was accepted');
// Built-in content is read-only for users.
assert.ok((await b.c.from('questions').update({ answer: 'A' }).eq('id', q.id).select()).data?.length !== 1, 'a user edited a question');

// User-written content: private to its author until placed in a class; class members see it.
const { data: topic } = await a.c.from('questions').select('topic_id').eq('id', q.id).single();
const mine = { topic_id: topic!.topic_id, body: 'x', choices: [{ key: 'A', text: '1' }, { key: 'B', text: '2' }], answer: 'A', hint: 'h', steps: ['s'] };
assert.ifError((await a.c.from('questions').insert({ id: `u/rls-${a.id}`, owner_id: a.id, ...mine })).error);
assert.equal((await b.c.from('questions').select('id').eq('id', `u/rls-${a.id}`)).data?.length, 0, 'B can see A’s private problem');
assert.ok((await a.c.from('questions').insert({ id: `u/rls-fig-${a.id}`, owner_id: a.id, figure: '<svg/>', ...mine })).error, 'a user set a raw SVG figure');
assert.ok((await b.c.from('questions').insert({ id: `u/rls-as-a-${b.id}`, owner_id: a.id, ...mine })).error, 'B wrote a problem as A');
const { data: cls } = await a.c.from('classes').insert({ name: 'RLS class' }).select('id, code').single();
assert.ok((await b.c.from('questions').insert({ id: `u/rls-b-${b.id}`, owner_id: b.id, class_id: cls!.id, ...mine })).error, 'B put a problem in A’s class');
assert.ifError((await a.c.from('questions').update({ class_id: cls!.id }).eq('id', `u/rls-${a.id}`)).error);
assert.equal((await b.c.from('classes').select('id').eq('id', cls!.id)).data?.length, 0, 'B sees a class before joining');
assert.equal((await b.c.rpc('join_class', { p_code: cls!.code.toLowerCase() })).data, 'RLS class');
assert.equal((await b.c.from('questions').select('id').eq('id', `u/rls-${a.id}`)).data?.length, 1, 'a class member cannot see the class problem');
assert.equal((await b.c.from('questions').update({ answer: 'B' }).eq('id', `u/rls-${a.id}`).select()).data?.length ?? 0, 0, 'a member edited the class problem');
assert.ifError((await b.c.from('flags').insert({ question_id: `u/rls-${a.id}`, note: 'step 1 is wrong' })).error);
assert.equal((await a.c.from('flags').select('note').eq('question_id', `u/rls-${a.id}`)).data?.length, 1, 'the author cannot see a report');
// Quizzes follow the same rules.
const { data: privQuiz } = await a.c.from('quizzes').insert({ title: 'A private', question_ids: [`u/rls-${a.id}`] }).select('id').single();
const { data: classQuiz } = await a.c.from('quizzes').insert({ title: 'A class', class_id: cls!.id, question_ids: [`u/rls-${a.id}`] }).select('id').single();
assert.equal((await b.c.from('quizzes').select('id').eq('id', privQuiz!.id)).data?.length, 0, 'B can see A’s private quiz');
assert.equal((await b.c.from('quizzes').select('id').eq('id', classQuiz!.id)).data?.length, 1, 'a class member cannot see the class quiz');
assert.equal((await b.c.from('quizzes').update({ title: 'hacked' }).eq('id', classQuiz!.id).select()).data?.length ?? 0, 0, 'a member edited the class quiz');
assert.ok((await b.c.from('quizzes').insert({ title: 'B in A class', class_id: cls!.id })).error, 'B put a quiz in A’s class');
await b.c.from('class_members').delete().eq('class_id', cls!.id).eq('user_id', b.id);
assert.equal((await b.c.from('questions').select('id').eq('id', `u/rls-${a.id}`)).data?.length, 0, 'B still sees the problem after leaving');
assert.equal((await b.c.from('quizzes').select('id').eq('id', classQuiz!.id)).data?.length, 0, 'B still sees the class quiz after leaving');

console.log('Access rules hold: user B could not read or change user A’s rows, files, or private content; class sharing works.');
