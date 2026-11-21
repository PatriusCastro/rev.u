'use server';
import { redirect } from 'next/navigation';
import { db, session } from '@/lib/supabase';
import { nextStage, dayOf, addDays, type Interval } from '@/lib/schedule';
import { inline } from '@/lib/math';

const back = (path: string, msg: string) => redirect(`${path}?msg=${encodeURIComponent(msg)}`);

// Sign in and setup

export async function signIn(form: FormData) {
  const supabase = await db();
  const { error } = await supabase.auth.signInWithPassword({ email: String(form.get('email')), password: String(form.get('password')) });
  if (error) back('/login', error.code === 'invalid_credentials' ? 'That email and password do not match. Check them, or create an account.' : error.message);
  redirect('/');
}

export async function signUp(form: FormData) {
  const supabase = await db();
  const { data, error } = await supabase.auth.signUp({ email: String(form.get('email')), password: String(form.get('password')) });
  if (error) back('/login', error.message);
  if (!data.session) back('/login', 'Check your email for a link to confirm your account.');
  redirect('/setup');
}

export async function signOut() {
  const supabase = await db();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function saveExamDate(form: FormData) {
  const { supabase, user } = await session();
  const date = String(form.get('exam_date'));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date <= dayOf()) back('/setup', 'Pick a date after today.');
  const { error } = await supabase.from('profiles').upsert({ id: user.id, exam_date: date });
  if (error) back('/setup', error.message);
  redirect('/');
}

// Starting a set

async function startAttempt(mode: 'practice' | 'repeat' | 'mock', questionIds: string[], extra: object = {}) {
  const { supabase } = await session();
  if (!questionIds.length) back('/', 'Nothing to work on there yet.');
  const { data, error } = await supabase.from('attempts').insert({ mode, question_ids: questionIds, ...extra }).select('id').single();
  if (error) throw new Error(error.message);
  redirect(`/attempt/${data.id}`);
}

const shuffle = <T,>(a: T[]) => a.map((v) => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v);

export async function startPractice(topicId: string) {
  const { supabase } = await session();
  const [{ data: qs }, { data: done }] = await Promise.all([
    supabase.from('questions').select('id').eq('topic_id', topicId),
    supabase.from('answers').select('question_id, correct, questions!inner(topic_id)').eq('questions.topic_id', topicId),
  ]);
  const right = new Set((done ?? []).filter((a) => a.correct).map((a) => a.question_id));
  const seen = new Set((done ?? []).map((a) => a.question_id));
  const ids = (qs ?? []).map((q) => q.id as string);
  // Unseen first, then ones never answered right, then the rest; 10 per set.
  const rank = (id: string) => (!seen.has(id) ? 0 : !right.has(id) ? 1 : 2);
  await startAttempt('practice', shuffle(ids).sort((a, b) => rank(a) - rank(b)).slice(0, 10));
}

export async function startRepeats() {
  const { supabase } = await session();
  const { data } = await supabase.from('repeats').select('question_id').is('cleared_at', null).lte('due', dayOf()).order('due');
  await startAttempt('repeat', (data ?? []).map((r) => r.question_id));
}

export async function startMock(subjectId: string) {
  const { supabase } = await session();
  const [{ data: subject }, { data: qs }] = await Promise.all([
    supabase.from('subjects').select('mock_items, mock_minutes').eq('id', subjectId).single(),
    supabase.from('questions').select('id, topics!inner(subject_id)').eq('topics.subject_id', subjectId),
  ]);
  if (!subject) back('/subjects', 'Unknown subject.');
  const ids = shuffle((qs ?? []).map((q) => q.id as string)).slice(0, subject!.mock_items);
  // Fewer problems than a full mock gets a proportional time limit.
  const minutes = Math.max(1, Math.ceil((subject!.mock_minutes * ids.length) / subject!.mock_items));
  await startAttempt('mock', ids, { subject_id: subjectId, minutes });
}

// Answering

export type AnswerResult = { correct: boolean; answer: string; steps: string[]; stage: string | null; message: string } | { error: string };

const GRACE_MS = 30_000;

export async function submitAnswer(attemptId: string, questionId: string, choice: string): Promise<AnswerResult> {
  const { supabase } = await session();
  const { data: attempt } = await supabase.from('attempts').select('mode, question_ids, minutes, started_at, finished_at').eq('id', attemptId).single();
  if (!attempt || !attempt.question_ids.includes(questionId)) return { error: 'This problem is not part of this set.' };
  if (attempt.finished_at) return { error: 'This set is already finished.' };
  if (attempt.mode === 'mock' && Date.now() > Date.parse(attempt.started_at) + attempt.minutes * 60_000 + GRACE_MS) {
    await supabase.from('attempts').update({ finished_at: new Date().toISOString() }).eq('id', attemptId);
    return { error: 'Time is up. Your answers so far are saved.' };
  }
  const { data: q } = await supabase.from('questions').select('answer, steps').eq('id', questionId).single();
  if (!q) return { error: 'Problem not found.' };
  const correct = q.answer === choice;

  const { error } = await supabase.from('answers').insert({ attempt_id: attemptId, question_id: questionId, choice, correct });
  if (error) return { error: error.code === '23505' ? 'You already answered this one.' : error.message };

  // Spaced repeat rule (src/lib/schedule.ts). Mock mistakes enter the notebook the same way.
  const today = dayOf();
  const { data: rep } = await supabase.from('repeats').select('interval, due, misses, cleared_at').eq('question_id', questionId).maybeSingle();
  const active = rep && !rep.cleared_at;
  const next = nextStage(active ? (rep.interval as Interval) : null, correct, active ? rep.due <= today : false);
  // shortcut: the answer and the notebook update are two writes, not one transaction; move both into a
  // Postgres function if partial failures show up. Until then a failed update is reported, not swallowed.
  const write = next === 'cleared'
    ? await supabase.from('repeats').update({ cleared_at: new Date().toISOString() }).eq('question_id', questionId)
    : next !== null
      ? await supabase.from('repeats').upsert({ question_id: questionId, interval: next, due: addDays(today, next), cleared_at: null, misses: (rep?.misses ?? 0) + (correct ? 0 : 1) })
      : { error: null };
  if (write.error) return { error: 'Your answer is saved, but the notebook did not update. Try the next problem; this one may not come back on schedule.' };

  const { count } = await supabase.from('answers').select('id', { count: 'exact', head: true }).eq('attempt_id', attemptId);
  if (count === attempt.question_ids.length) await supabase.from('attempts').update({ finished_at: new Date().toISOString() }).eq('id', attemptId);

  const stage = next === null ? (active ? String(rep.interval) : null) : String(next);
  // An empty choice is "Show me how": a miss, so it comes back like any other.
  const message = choice === '' ? 'Here is how it is solved. It comes back tomorrow.'
    : !correct ? 'Not yet. It comes back tomorrow.'
    : next === 'cleared' ? 'Correct. It is cleared from your notebook.'
    : next !== null ? `Correct. It comes back in ${next} days.`
    : 'Correct.';
  return { correct, answer: q.answer, steps: (q.steps as string[]).map(inline), stage, message };
}

export async function finishAttempt(attemptId: string) {
  const { supabase } = await session();
  await supabase.from('attempts').update({ finished_at: new Date().toISOString() }).eq('id', attemptId).is('finished_at', null);
}

// Library

export async function recordDocument(path: string, title: string, topicId: string): Promise<{ error?: string }> {
  const { supabase, user } = await session();
  const [folder, name] = path.split('/');
  if (folder !== user.id || !name) return { error: 'Upload path is not yours.' };
  // Trust the stored object, not the browser: it must exist and be a PDF under the bucket limits.
  const { data: list } = await supabase.storage.from('library').list(folder, { search: name });
  const obj = list?.find((o) => o.name === name);
  if (!obj) return { error: 'The upload did not finish. Try again.' };
  if (obj.metadata?.mimetype !== 'application/pdf') {
    await supabase.storage.from('library').remove([path]);
    return { error: 'Only PDF files can be added.' };
  }
  const { error } = await supabase.from('documents').insert({ path, title: title.trim().slice(0, 120) || name, topic_id: topicId || null, size: obj.metadata.size });
  return error ? { error: error.message } : {};
}

export async function deleteDocument(id: string) {
  const { supabase } = await session();
  const { data: doc } = await supabase.from('documents').select('path').eq('id', id).single();
  if (doc) {
    await supabase.storage.from('library').remove([doc.path]);
    await supabase.from('documents').delete().eq('id', id);
  }
  redirect('/library');
}
