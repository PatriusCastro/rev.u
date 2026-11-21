'use server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { db, session } from '@/lib/supabase';
import { revoke, savedAccounts, writeSaved } from '@/lib/saved';
import { revalidatePath } from 'next/cache';
import { dayOf } from '@/lib/schedule';
import { inline } from '@/lib/math';
import { checkProblem } from '@/lib/content';

const back = (path: string, msg: string) => redirect(`${path}?msg=${encodeURIComponent(msg)}`);

// Sign in and setup

export type AuthState = { email: string; error?: string; sent?: boolean };
const MIN_PASSWORD = 8;
const SHORT_PASSWORD = `Use a longer password: at least ${MIN_PASSWORD} characters.`;
const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: 'That email and password do not match. Check them, or create an account.',
  user_already_exists: 'An account with this email already exists. Sign in instead.',
  email_exists: 'An account with this email already exists. Sign in instead.',
  email_not_confirmed: 'Confirm your email first: open the link we sent you.',
  weak_password: SHORT_PASSWORD,
  same_password: 'That is your current password. Choose a new one.',
  otp_expired: 'That code is wrong or has expired. Check the email, or send a new code.',
  over_request_rate_limit: 'Too many tries. Wait a minute, then try again.',
  over_email_send_rate_limit: 'Too many emails sent. Wait a minute, then try again.',
};
const authError = (code?: string, message?: string) => (code && AUTH_ERRORS[code]) ?? message ?? 'Something went wrong. Try again.';
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Remembered so the sign-in form is filled in next time, including after signing out. Read by /login.
async function rememberEmail(email: string) {
  (await cookies()).set('revu_email', email, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' });
}

// Return the form's state instead of redirecting on errors, so the email stays filled in.
function readAuthForm(form: FormData) {
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const error = !validEmail(email) ? 'Enter a valid email address.' : !password ? 'Enter your password.' : undefined;
  return { email, password, error };
}

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const { email, password, error: bad } = readAuthForm(form);
  if (bad) return { email, error: bad };
  const supabase = await db();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { email, error: authError(error.code, error.message) };
  await rememberEmail(email);
  redirect('/');
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const { email, password, error: bad } = readAuthForm(form);
  if (bad) return { email, error: bad };
  // Checked here too: the browser's minLength is only a hint, and the auth server allows shorter.
  if (password.length < MIN_PASSWORD) return { email, error: SHORT_PASSWORD };
  const supabase = await db();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { email, error: authError(error.code, error.message) };
  if (!data.session) return { email, sent: true };
  await rememberEmail(email);
  redirect('/setup');
}

/** Sign in, or create an account, with a 6-digit code sent by email. The form's button says which step. */
export async function emailCode(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get('email') ?? '').trim();
  if (!validEmail(email)) return { email, error: 'Enter a valid email address.' };
  const supabase = await db();
  if (form.get('intent') === 'send') {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) return { email, error: authError(error.code, error.message) };
    return { email, sent: true };
  }
  const token = String(form.get('code') ?? '').replace(/\D/g, '');
  if (token.length !== 6) return { email, sent: true, error: 'Enter the 6-digit code from the email.' };
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) return { email, sent: true, error: authError(error.code, error.message) };
  await rememberEmail(email);
  redirect('/'); // Today sends new accounts on to the exam date.
}

/** Always reports success, so the form does not reveal which emails have accounts. */
export async function sendReset(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get('email') ?? '').trim();
  if (!validEmail(email)) return { email, error: 'Enter a valid email address.' };
  const supabase = await db();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error?.code?.startsWith('over_')) return { email, error: authError(error.code) };
  return { email, sent: true };
}

/** After the reset link: the link signed the user in, so this only sets the new password. */
export async function setPassword(_: AuthState, form: FormData): Promise<AuthState> {
  const { supabase } = await session();
  const password = String(form.get('password') ?? '');
  if (password.length < MIN_PASSWORD) return { email: '', error: SHORT_PASSWORD };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { email: '', error: authError(error.code, error.message) };
  redirect('/');
}

/** Sign out of this device. With "save" ticked the session is kept for one-tap sign-in instead of ended. */
export async function signOut(form: FormData) {
  const supabase = await db();
  if (form.get('save') === 'on') {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (s?.refresh_token && s.user.email) {
      const list = await savedAccounts();
      const old = list.find((a) => a.email === s.user.email);
      if (old && old.token !== s.refresh_token) await revoke(old.token);
      await writeSaved([{ email: s.user.email, token: s.refresh_token }, ...list.filter((a) => a.email !== s.user.email)]);
      // Drop this browser's session cookies without ending the session on the server, so one tap can resume it.
      const store = await cookies();
      store.getAll().filter((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')).forEach((c) => store.delete(c.name));
      redirect('/login?msg=saved');
    }
  }
  // This device only: signing out on a shared computer should not end the session on the user's phone.
  await supabase.auth.signOut({ scope: 'local' });
  redirect('/login?msg=signed_out');
}

/** One-tap sign-in with an account saved on this browser. */
export async function continueAs(email: string) {
  const list = await savedAccounts();
  const account = list.find((a) => a.email === email);
  await writeSaved(list.filter((a) => a.email !== email)); // in use now; signing out with "save" saves it again
  await rememberEmail(email);
  if (account) {
    const { error } = await (await db()).auth.refreshSession({ refresh_token: account.token });
    if (!error) redirect('/');
  }
  redirect('/login?add=1&msg=saved_expired');
}

/** Remove a saved account from this browser and end its session. */
export async function forgetAccount(email: string) {
  const list = await savedAccounts();
  const account = list.find((a) => a.email === email);
  await writeSaved(list.filter((a) => a.email !== email));
  if (account) await revoke(account.token);
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

export async function startQuiz(quizId: string) {
  const { supabase } = await session();
  const { data: quiz } = await supabase.from('quizzes').select('id, minutes, question_ids').eq('id', quizId).maybeSingle();
  if (!quiz) back('/subjects', 'That quiz is no longer available.');
  // Row rules hide problems this reviewer cannot see; the author's order is kept.
  const { data: qs } = await supabase.from('questions').select('id').in('id', quiz!.question_ids);
  const visible = new Set((qs ?? []).map((q) => q.id as string));
  await startAttempt('mock', quiz!.question_ids.filter((id: string) => visible.has(id)), { quiz_id: quiz!.id, minutes: quiz!.minutes });
}

// Answering: one database call each (submit_answer, finish_attempt), so an answer and its notebook update
// succeed or fail together.

export type AnswerResult =
  | { correct: boolean; answer: string; steps: string[]; stage: string | null; message: string }
  | { saved: true }
  | { error: string; over?: boolean };

export async function submitAnswer(attemptId: string, questionId: string, choice: string): Promise<AnswerResult> {
  const { supabase } = await session();
  const { data, error } = await supabase.rpc('submit_answer', { p_attempt: attemptId, p_question: questionId, p_choice: choice });
  if (error) return { error: 'Your answer could not be saved. Check your connection and try again.' };
  if (data.error || data.saved) return data;
  // An empty choice is "Show me how": a miss, so it comes back like any other.
  const message = choice === '' ? 'Here is how it is solved. It comes back tomorrow.'
    : !data.correct ? 'Not yet. It comes back tomorrow.'
    : data.stage === 'cleared' ? 'Correct. It is cleared from your notebook.'
    : data.moved ? `Correct. It comes back in ${data.stage} days.`
    : 'Correct.';
  return { correct: data.correct, answer: data.answer, steps: (data.steps as string[]).map(inline), stage: data.stage, message };
}

export async function finishAttempt(attemptId: string) {
  const { supabase } = await session();
  await supabase.rpc('finish_attempt', { p_attempt: attemptId });
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

// Writing content. Anyone can write; row rules make it private to the author unless placed in a class they own.

export type ProblemInput = { id?: string; quiz_id?: string; topic_id: string; class_id: string; title: string; body: string; choices: { key: string; text: string }[]; answer: string; hint: string; steps: string[] };
export type TopicInput = { id?: string; subject_id: string; class_id: string; area: string; name: string; minutes: number; lesson: string };
type Saved = { error: string } | { id: string };

const newId = () => 'u/' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
const tooLong = (fields: [string, string, number][]) => fields.find(([, v, max]) => v.length > max)?.[0];
const rowError = (code?: string, message?: string) =>
  code === '42501' ? 'You can only add content to your own classes, under a built-in topic or your own topic with the same audience.' : message ?? 'Could not save.';

export async function saveProblem(input: ProblemInput): Promise<Saved> {
  const { supabase, user } = await session();
  const choices = input.choices.map((c) => ({ key: c.key, text: c.text.trim() })).filter((c) => c.text);
  const steps = input.steps.map((s) => s.trim()).filter(Boolean);
  try {
    checkProblem({ topic: input.topic_id, title: input.title, answer: input.answer, hint: input.hint, body: input.body, choices, steps });
  } catch (e) {
    return { error: 'Not saved: ' + (e as Error).message.replace(/"(\w+):"/, '$1') + '.' };
  }
  const long = tooLong([['Problem', input.body, 4000], ['Hint', input.hint, 1000], ['Title', input.title, 120], ...steps.map((s, i): [string, string, number] => [`Step ${i + 1}`, s, 2000]), ...choices.map((c): [string, string, number] => [`Choice ${c.key}`, c.text, 300])]);
  if (long) return { error: `${long} is too long.` };
  if (steps.length > 20) return { error: 'Use 20 steps or fewer.' };
  const row = { topic_id: input.topic_id, class_id: input.class_id || null, title: input.title.trim() || null, body: input.body.trim(), choices, answer: input.answer, hint: input.hint.trim(), steps, owner_id: user.id };
  const { data: quiz } = input.quiz_id
    ? await supabase.from('quizzes').select('question_ids, class_id').eq('id', input.quiz_id).eq('owner_id', user.id).maybeSingle()
    : { data: null };
  if (quiz && quiz.class_id !== row.class_id) return { error: 'Not saved: a problem in this quiz needs the same Who sees it as the quiz.' };
  const { error } = input.id
    ? await supabase.from('questions').update(row).eq('id', input.id).eq('owner_id', user.id)
    : await supabase.from('questions').insert({ id: (input.id = newId()), ...row });
  if (error) return { error: rowError(error.code, error.message) };
  // Written from a quiz: add it to the end of that quiz.
  if (quiz && !quiz.question_ids.includes(input.id)) await supabase.from('quizzes').update({ question_ids: [...quiz.question_ids, input.id] }).eq('id', input.quiz_id!);
  revalidatePath('/write');
  return { id: input.id };
}

export type QuizInput = { id?: string; class_id: string; title: string; minutes: string; question_ids: string[] };

export async function saveQuiz(input: QuizInput): Promise<Saved> {
  const { supabase, user } = await session();
  const title = input.title.trim();
  if (!title) return { error: 'Not saved: give the quiz a title.' };
  if (title.length > 120) return { error: 'Title is too long.' };
  const minutes = input.minutes.trim() ? Math.round(Number(input.minutes)) : null;
  if (minutes !== null && !(minutes >= 1 && minutes <= 300)) return { error: 'Not saved: the time limit is 1 to 300 minutes, or leave it empty for none.' };
  const ids = [...new Set(input.question_ids)].slice(0, 100);
  // Every problem must be one the quiz's audience can see: the author's own with the same audience, or built-in.
  const { data: qs } = await supabase.from('questions').select('id, owner_id, class_id').in('id', ids.length ? ids : ['']);
  const ok = new Set((qs ?? []).filter((q) => q.owner_id === null || (q.owner_id === user.id && (q.class_id ?? '') === input.class_id)).map((q) => q.id));
  const bad = ids.filter((id) => !ok.has(id));
  if (bad.length) return { error: `Not saved: ${bad.length === 1 ? 'one problem has' : `${bad.length} problems have`} a different audience from the quiz. Change the problem's Who sees it, or remove it.` };
  const row = { title, class_id: input.class_id || null, minutes, question_ids: ids, owner_id: user.id };
  const { data, error } = input.id
    ? await supabase.from('quizzes').update(row).eq('id', input.id).eq('owner_id', user.id).select('id').single()
    : await supabase.from('quizzes').insert(row).select('id').single();
  if (error || !data) return { error: rowError(error?.code, error?.message) };
  revalidatePath('/write'); revalidatePath('/subjects');
  return { id: data.id };
}

export async function deleteQuiz(id: string) {
  const { supabase, user } = await session();
  // The problems stay; only the quiz goes.
  await supabase.from('quizzes').delete().eq('id', id).eq('owner_id', user.id);
  redirect('/write');
}

export async function saveTopic(input: TopicInput): Promise<Saved> {
  const { supabase, user } = await session();
  if (!input.name.trim() || !input.area.trim() || !input.lesson.trim()) return { error: 'Not saved: give the lesson an area, a name and some text.' };
  const long = tooLong([['Name', input.name, 120], ['Area', input.area, 60], ['Lesson', input.lesson, 20000]]);
  if (long) return { error: `${long} is too long.` };
  const row = { subject_id: input.subject_id, class_id: input.class_id || null, area: input.area.trim(), name: input.name.trim(), minutes: Math.min(120, Math.max(1, Math.round(input.minutes) || 8)), lesson: input.lesson.trim(), sort: 1000, owner_id: user.id };
  const { error } = input.id
    ? await supabase.from('topics').update(row).eq('id', input.id).eq('owner_id', user.id)
    : await supabase.from('topics').insert({ id: (input.id = newId()), ...row });
  if (error) return { error: rowError(error.code, error.message) };
  revalidatePath('/write');
  return { id: input.id };
}

export async function deleteContent(kind: 'questions' | 'topics', id: string) {
  const { supabase, user } = await session();
  // Deleting a lesson also deletes its problems, and everyone's answers and repeats for them.
  await supabase.from(kind).delete().eq('id', id).eq('owner_id', user.id);
  redirect('/write');
}

// Classes

export async function createClass(form: FormData) {
  const { supabase } = await session();
  const name = String(form.get('name') ?? '').trim();
  if (!name || name.length > 80) back('/classes', 'Give the class a name of up to 80 characters.');
  const { error } = await supabase.from('classes').insert({ name });
  if (error) back('/classes', error.message);
  redirect('/classes');
}

export async function joinClass(form: FormData) {
  const { supabase } = await session();
  const { data, error } = await supabase.rpc('join_class', { p_code: String(form.get('code') ?? '') });
  if (error || !data) back('/classes', 'No class has that code. Check it with your instructor.');
  back('/classes', `You joined ${data}. Its lessons and problems now appear in Subjects.`);
}

export async function leaveClass(classId: string) {
  const { supabase, user } = await session();
  await supabase.from('class_members').delete().eq('class_id', classId).eq('user_id', user.id);
  redirect('/classes');
}

export async function deleteClass(classId: string) {
  const { supabase, user } = await session();
  // Its lessons and problems stay, private to their author.
  await supabase.from('classes').delete().eq('id', classId).eq('owner_id', user.id);
  redirect('/classes');
}

// Reports

export async function reportProblem(questionId: string, note: string): Promise<{ error?: string }> {
  const { supabase } = await session();
  const text = note.trim();
  if (!text) return { error: 'Say what looks wrong.' };
  if (text.length > 500) return { error: 'Keep it under 500 characters.' };
  const { error } = await supabase.from('flags').insert({ question_id: questionId, note: text });
  return error ? { error: 'Could not send the report. Try again.' } : {};
}

export async function resolveReport(flagId: string) {
  const { supabase } = await session();
  await supabase.from('flags').update({ resolved_at: new Date().toISOString() }).eq('id', flagId);
  redirect('/write');
}
