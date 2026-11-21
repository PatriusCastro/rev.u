// Tests the spaced repeat rule and mock exam answers in the database (apply_repeat, submit_answer, finish_attempt).
// Creates a throwaway user, so run it against a local or staging project. Usage: npm run check:repeats
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
assert.ok(url && key, 'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
const c = createClient(url, key, { auth: { persistSession: false } });
const { data: auth, error } = await c.auth.signUp({ email: `repeat-${Date.now()}@example.com`, password: 'check-password-123' });
assert.ok(!error && auth.session, `sign-up failed: ${error?.message}`);

const { data: q } = await c.from('questions').select('id, answer').is('owner_id', null).limit(1).single();
assert.ok(q, 'import content first (npm run import)');
const wrong = q.answer === 'A' ? 'B' : 'A';
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date());

async function answer(choice: string, mode = 'practice') {
  const { data: att } = await c.from('attempts').insert({ mode, question_ids: [q!.id], minutes: mode === 'mock' ? 10 : null }).select('id').single();
  const { data, error } = await c.rpc('submit_answer', { p_attempt: att!.id, p_question: q!.id, p_choice: choice });
  assert.ifError(error);
  return { ...data, attempt: att!.id };
}
const repeat = async () => (await c.from('repeats').select('interval, due, misses, cleared_at').eq('question_id', q.id).maybeSingle()).data;
const makeDue = () => c.from('repeats').update({ due: today }).eq('question_id', q.id);

let r = await answer(q.answer);
assert.equal(r.correct, true); assert.equal(r.stage, null, 'a right answer on a new problem stays out of the notebook');
assert.equal(await repeat(), null);

r = await answer(wrong);
assert.equal(r.stage, '1'); assert.equal(r.answer, q.answer, 'the correct choice comes back after answering');
assert.equal((await repeat())!.interval, 1, 'a miss enters at 1 day');

r = await answer(q.answer);
assert.equal(r.moved, false, 'a right answer before it is due does not move it'); assert.equal(r.stage, '1');

for (const [from, to] of [['1', '3'], ['3', '7'], ['7', 'cleared']]) {
  await makeDue(); r = await answer(q.answer);
  assert.equal(r.stage, to, `due ${from}-day repeat answered right should go to ${to}`); assert.equal(r.moved, true);
}
assert.ok((await repeat())!.cleared_at, 'cleared');

r = await answer('');
assert.equal(r.correct, false, '"Show me how" counts as a miss'); assert.equal(r.stage, '1');
const rep = (await repeat())!;
assert.equal(rep.cleared_at, null, 'a miss after clearing puts it back'); assert.equal(rep.misses, 2);

// Mock: answers can change, nothing is revealed, and the final answer goes through the rule at the end.
const { data: att } = await c.from('attempts').insert({ mode: 'mock', question_ids: [q.id], minutes: 10 }).select('id').single();
const m1 = (await c.rpc('submit_answer', { p_attempt: att!.id, p_question: q.id, p_choice: wrong })).data;
assert.deepEqual(m1, { saved: true }, 'mock reveals nothing');
await c.rpc('submit_answer', { p_attempt: att!.id, p_question: q.id, p_choice: q.answer });
const { data: saved } = await c.from('answers').select('choice').eq('attempt_id', att!.id);
assert.deepEqual(saved, [{ choice: q.answer }], 'a changed mock answer replaces the old one');
await makeDue();
await c.rpc('finish_attempt', { p_attempt: att!.id });
assert.equal((await repeat())!.interval, 3, 'finishing the mock applies the final answer to the notebook');
const late = (await c.rpc('submit_answer', { p_attempt: att!.id, p_question: q.id, p_choice: wrong })).data;
assert.ok(late.error, 'no answers after the mock ends');

console.log('Repeat rule holds: 1 → 3 → 7 → cleared, misses reset to 1 day, mock answers change until the end.');
