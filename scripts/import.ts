// Checks every file in content/ and loads it into the database. Usage: npm run import [-- --check]
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (read from .env.local).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { parseLesson, parseProblem } from '../src/lib/content.ts';

const root = join(import.meta.dirname, '..', 'content');
const files = (dir: string, ext: string): string[] =>
  readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((f) => f.isFile() && f.name.endsWith(ext))
    .map((f) => join(f.parentPath, f.name));
const idOf = (base: string, file: string, ext: string) => relative(base, file).replace(/\\/g, '/').slice(0, -ext.length);

const meta = JSON.parse(readFileSync(join(root, 'subjects.json'), 'utf8'));
const subjectIds = new Set(meta.subjects.map((s: { id: string }) => s.id));
const errors: string[] = [];

const topics = files(join(root, 'lessons'), '.md').flatMap((f, i) => {
  try {
    const l = parseLesson(readFileSync(f, 'utf8'));
    if (!subjectIds.has(l.subject)) throw new Error(`unknown subject "${l.subject}"`);
    return [{ id: idOf(join(root, 'lessons'), f, '.md'), subject_id: l.subject, area: l.area, name: l.name, minutes: l.minutes, lesson: l.lesson, sort: l.order || i }];
  } catch (e) { errors.push(`${relative(root, f)}: ${(e as Error).message}`); return []; }
});
const topicIds = new Set(topics.map((t) => t.id));

const questions = files(join(root, 'problems'), '.txt').flatMap((f) => {
  try {
    const p = parseProblem(readFileSync(f, 'utf8'));
    if (!topicIds.has(p.topic)) throw new Error(`unknown topic "${p.topic}" (no lesson file for it)`);
    let figure: string | null = null;
    if (p.figure) {
      const fig = join(root, 'figures', p.figure);
      if (!existsSync(fig)) throw new Error(`figure "${p.figure}" not found`);
      figure = readFileSync(fig, 'utf8').trim();
    }
    return [{ id: idOf(join(root, 'problems'), f, '.txt'), topic_id: p.topic, body: p.body, choices: p.choices, answer: p.answer, hint: p.hint, steps: p.steps, figure }];
  } catch (e) { errors.push(`${relative(root, f)}: ${(e as Error).message}`); return []; }
});

if (errors.length) {
  console.error(`Refused. Fix these ${errors.length} file(s) and run again:\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`Checked ${topics.length} lessons and ${questions.length} problems.`);
if (process.argv.includes('--check')) process.exit(0);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'); process.exit(1); }
const db = createClient(url, key, { auth: { persistSession: false } });

async function upsert(table: string, rows: object[]) {
  const { error } = await db.from(table).upsert(rows);
  if (error) throw new Error(`${table}: ${error.message}`);
}
// Upsert only: removing a file does not delete its row, so reviewers' answers to it are kept.
await upsert('exams', [meta.exam]);
await upsert('subjects', meta.subjects.map((s: object, sort: number) => ({ ...s, exam_id: meta.exam.id, sort })));
await upsert('topics', topics);
await upsert('questions', questions);
console.log('Imported.');
