import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextStage, addDays, daysBetween, dayOf } from '../src/lib/schedule.ts';
import { rankTopics, dailyTarget, streak, weekDays } from '../src/lib/plan.ts';
import { parseProblem } from '../src/lib/content.ts';
import { inline, rich } from '../src/lib/math.ts';

test('repeat interval rule', () => {
  assert.equal(nextStage(null, false, false), 1, 'a miss enters the notebook at 1 day');
  assert.equal(nextStage(null, true, false), null, 'a correct new problem stays out');
  assert.equal(nextStage(1, true, true), 3);
  assert.equal(nextStage(3, true, true), 7);
  assert.equal(nextStage(7, true, true), 'cleared');
  assert.equal(nextStage(7, false, true), 1, 'a miss at any point goes back to 1 day');
  assert.equal(nextStage(3, true, false), null, 'right answer before it is due does not move it');
});

test('day arithmetic', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(daysBetween('2026-11-21', '2026-11-28'), 7);
  assert.equal(dayOf('2026-11-21T17:00:00Z'), '2026-11-22', 'Manila is UTC+8');
});

test('weakest topics first, unknown between weak and strong', () => {
  const t = (id: string, answered: number, correct: number, weight = 35, unseen = 5) => ({ id, weight, answered, correct, unseen });
  const ranked = rankTopics([t('strong', 10, 9), t('unknown', 2, 2), t('weak', 10, 2), t('done', 10, 1, 35, 0)]);
  assert.deepEqual(ranked.map((x) => x.id), ['weak', 'unknown', 'strong', 'done']);
  const weighted = rankTopics([t('light', 10, 5, 30), t('heavy', 10, 5, 35)]);
  assert.equal(weighted[0].id, 'heavy', 'subject weight breaks ties');
});

test('daily target, streak and week', () => {
  assert.equal(dailyTarget(200, 128), 2);
  assert.equal(dailyTarget(15, 0), 15);
  const days = new Set(['2026-11-19', '2026-11-20']);
  assert.equal(streak(days, '2026-11-21', addDays), 2, 'today still empty keeps yesterday’s streak');
  assert.equal(streak(new Set([...days, '2026-11-21']), '2026-11-21', addDays), 3);
  assert.equal(streak(days, '2026-11-22', addDays), 0);
  assert.deepEqual(weekDays('2026-11-21', addDays).slice(0, 1), ['2026-11-16'], '21 Nov 2026 is a Saturday');
});

const good = `topic: trigonometry/angles-of-elevation
answer: C
hint: Start at B.

From A the angle is 30°.

A. 20.00 m    B. 28.28 m    C. 34.64 m    D. 40.00 m

## Solution
Let $x$ be the distance.
---
$h = 20\\sqrt{3}$ m.`;

test('problem parser', () => {
  const p = parseProblem(good);
  assert.equal(p.body, 'From A the angle is 30°.');
  assert.deepEqual(p.choices.map((c) => c.text), ['20.00 m', '28.28 m', '34.64 m', '40.00 m']);
  assert.equal(p.steps.length, 2);
  assert.throws(() => parseProblem(good.replace('answer: C', 'answer: E')), /not one of the choices/);
  assert.throws(() => parseProblem(good.replace('answer: C\n', '')), /not one of the choices/);
  assert.throws(() => parseProblem(good.split('## Solution')[0]), /missing "## Solution"/);
  assert.throws(() => parseProblem(good.replace(/## Solution[\s\S]*/, '## Solution\n---\n')), /no steps/);
});

test('math renderer escapes text and renders math', () => {
  assert.match(inline('a <b> $x^2$'), /a &lt;b&gt; <span class="katex">/);
  assert.equal(rich('## Sine law\nUse it.\n\n- one\n- two'), '<h2>Sine law</h2><p>Use it.</p><ul><li>one</li><li>two</li></ul>');
});
