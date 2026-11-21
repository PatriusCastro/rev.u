// Parsers for the plain-text content files in content/. See content/README.md for the format.

export type Choice = { key: string; text: string };
export type Problem = { topic: string; title?: string; answer: string; hint: string; figure?: string; body: string; choices: Choice[]; steps: string[] };

/** The rules every problem must pass, from a file or from the in-app editor. Throws the first problem found. */
export function checkProblem(p: Problem): Problem {
  if (!p.topic) throw new Error('missing "topic:"');
  if (!p.body.trim()) throw new Error('missing the problem statement');
  if (p.choices.filter((c) => c.text.trim()).length < 2) throw new Error('fewer than 2 choices');
  if (!p.choices.some((c) => c.key === p.answer && c.text.trim())) throw new Error(`answer "${p.answer ?? ''}" is not one of the choices`);
  if (!p.hint.trim()) throw new Error('missing "hint:"');
  if (!p.steps.some((s) => s.trim())) throw new Error('the solution has no steps');
  return p;
}
export type Lesson = { subject: string; area: string; name: string; minutes: number; order: number; lesson: string };

function headerAndRest(src: string): [Record<string, string>, string] {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const head: Record<string, string> = {};
  let i = 0;
  for (; i < lines.length && lines[i].trim(); i++) {
    const m = lines[i].match(/^([a-z]+):\s*(.*)$/);
    if (!m) throw new Error(`line ${i + 1}: expected "key: value" in the header`);
    head[m[1]] = m[2].trim();
  }
  return [head, lines.slice(i).join('\n').trim()];
}

export function parseProblem(src: string): Problem {
  const [head, rest] = headerAndRest(src);
  const [statement, solution] = rest.split(/^## Solution\s*$/m);
  if (solution === undefined) throw new Error('missing "## Solution"');
  const steps = solution.split(/^---\s*$/m).map((s) => s.trim()).filter(Boolean);
  if (!steps.length) throw new Error('the solution has no steps');

  // Choices start at the first line beginning "A." and run to the end of the statement.
  const at = statement.search(/^A\.\s/m);
  if (at < 0) throw new Error('no choices found (a line starting "A.")');
  const body = statement.slice(0, at).trim();
  const choices = [...statement.slice(at).replace(/\s+/g, ' ').matchAll(/([A-E])\.\s+(.+?)(?=\s+[A-E]\.\s|$)/g)]
    .map((m) => ({ key: m[1], text: m[2].trim() }));
  return checkProblem({ topic: head.topic, title: head.title, answer: head.answer, hint: head.hint ?? '', figure: head.figure, body, choices, steps });
}

export function parseLesson(src: string): Lesson {
  const [head, lesson] = headerAndRest(src);
  for (const k of ['subject', 'area', 'name']) if (!head[k]) throw new Error(`missing "${k}:"`);
  if (!lesson) throw new Error('the lesson is empty');
  return { subject: head.subject, area: head.area, name: head.name, minutes: Number(head.minutes) || 8, order: Number(head.order) || 0, lesson };
}
