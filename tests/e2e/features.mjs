// Browser journeys against a running app (npm run dev) and local Supabase. Usage: npm run test:e2e
// Set CHROME_PATH if Chrome is not in the default Windows location; BASE to test another URL.
import { chromium } from 'playwright-core';
const BASE = process.env.BASE ?? 'http://localhost:3000';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
import { mkdirSync } from 'node:fs';
const shots = import.meta.dirname + '/out/'; mkdirSync(shots, { recursive: true });
const results = [];
const check = (name, ok, extra = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`); };

async function newUser(tag) {
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  page.errors = []; page.on('pageerror', (e) => page.errors.push(String(e)));
  page.on('dialog', (d) => { page.lastDialog = d.message(); d.accept(); });
  await page.goto(BASE + '/login');
  await page.fill('input[name=email]', `${tag}-${Date.now()}@revu.test`); await page.fill('input[name=password]', 'feature-pass-1');
  await page.click('text=Create an account'); await page.waitForURL('**/setup');
  await page.fill('input[name=exam_date]', '2027-03-01'); await page.click('text=Save exam date'); await page.waitForURL(BASE + '/');
  return page;
}

// 1. Mock exam: answer, skip, go back, finish with an unanswered problem.
const s = await newUser('student');
await s.goto(BASE + '/subjects/math'); await s.click('text=Take a mock exam'); await s.waitForURL('**/attempt/**');
const mockUrl = s.url().split('?')[0];
await s.click('.opts button >> nth=1'); await s.click('button:has-text("Save and next")'); await s.waitForSelector('h1:has-text("Mock exam 2 of")');
check('mock: save and next moves to problem 2', s.url().endsWith('?q=1'));
await s.click('button:has-text("Skip for now")'); await s.waitForSelector('h1:has-text("Mock exam 3 of")');
await s.click('button:has-text("Previous")'); await s.waitForSelector('h1:has-text("Mock exam 2 of")');
await s.click('button:has-text("Previous")'); await s.waitForSelector('h1:has-text("Mock exam 1 of")');
check('mock: saved answer is still selected after going back', await s.locator('.opts button.on, .opts button[aria-pressed="true"]').count() === 1);
const count = Number((await s.textContent('h1')).match(/of (\d+)/)[1]);
await s.goto(`${mockUrl}?q=${count - 1}`);
await s.click('.opts button >> nth=0');
check('mock: last problem says Save and finish', await s.isVisible('button:has-text("Save and finish")'));
await s.click('button:has-text("Save and finish")');
await s.waitForSelector('h1:has-text("%")', { timeout: 15000 });
check('mock: Save and finish ends the exam', true, await s.textContent('h1'));
check('mock: warned about unanswered problems', /no answer/.test(s.lastDialog ?? ''), s.lastDialog);
check('mock: summary lists every problem', await s.locator('.rows .item').count() === count);
await s.screenshot({ path: shots + 'f-mock-summary.png' });
await s.click('.rows .item >> nth=0'); await s.waitForURL('**/review/**');
check('summary row opens the review page', await s.locator('.steps li').count() > 0);
await s.goto(BASE + '/notebook?tab=soon');
const nb = await s.locator('.rows a.item').count();
check('mock mistakes reach the notebook', nb > 0, `${nb} rows`);
if (nb) { await s.click('.rows a.item >> nth=0'); await s.waitForURL('**/review/**'); check('notebook row opens the review page', await s.isVisible('text=Solution')); }

// 2. Instructor writes for a class; student joins and sees it.
const t = await newUser('teacher');
await t.goto(BASE + '/write'); await t.click('text=Classes'); await t.waitForURL('**/classes');
await t.fill('input[name=name]', 'Batch Test'); await t.click('button:has-text("Create class")'); await t.waitForSelector('text=Batch Test');
const code = (await t.textContent('.item b')).trim();
check('instructor: class created with a code', /^[A-Z0-9]{6}$/.test(code), code);

await t.goto(BASE + '/write/lesson');
await t.selectOption('select >> nth=1', { label: 'Class: Batch Test' });
await t.fill('input[placeholder^="For example: Trig"]', 'Hydraulics');
await t.locator('label:has-text("Lesson name") input').fill('Pressure basics');
await t.locator('label:has-text("Lesson") textarea').fill('## Pressure\nPressure is force over area: $p = \\dfrac{F}{A}$.\n\n<script>alert(1)</script>');
await t.click('button:has-text("Save lesson")'); await t.waitForURL('**/lesson/u/**');
check('instructor: lesson saved and shown', await t.isVisible('h1:has-text("Pressure basics")'));
check('lesson text is escaped, not run', (await t.content()).includes('&lt;script&gt;'));
const lessonUrl = t.url();

await t.click('text=Write a problem for this topic'); await t.waitForURL('**/write/problem?topic=**');
check('problem editor: audience follows the lesson', await t.locator('select >> nth=1').isDisabled());
await t.locator('label:has-text("Title") input').fill('Force on a plate');
await t.locator('label:has-text("Problem") textarea').fill('A force of 200 N acts on a plate of $0.5\\ \\text{m}^2$. Find the pressure.');
await t.fill('input[aria-label="Choice A"]', '100 Pa'); await t.fill('input[aria-label="Choice B"]', '400 Pa');
await t.check('input[aria-label="B is correct"]');
await t.locator('label:has-text("Hint") textarea').fill('Divide force by area.');
await t.click('button:has-text("Save problem")');
await t.waitForSelector('p.err', { timeout: 8000 }).catch(() => {});
check('problem editor: refuses a problem with no solution', await t.isVisible('text=no steps'), await t.locator('p.err').textContent().catch(() => ''));
await t.fill('textarea[aria-label="Step 1"]', '$p = \\dfrac{200}{0.5} = 400$ Pa.');
await t.click('button:has-text("Save problem")'); await t.waitForURL('**/review/u/**');
check('instructor: problem saved, review shows the solution', await t.isVisible('text=Force on a plate') && await t.locator('.steps li').count() === 1);
await t.screenshot({ path: shots + 'f-teacher-review.png', fullPage: true });

// Quiz: one problem written before, one written from the quiz.
await t.goto(BASE + '/write'); await t.click('text=New quiz'); await t.waitForURL('**/write/quiz');
await t.locator('label:has-text("Title") input').fill('Pressure quiz');
await t.selectOption('label:has-text("Who sees it") select', { label: 'Class: Batch Test' });
await t.locator('label:has-text("Time limit") input').fill('10');
await t.selectOption('label:has-text("Add a problem you wrote before") select', { label: 'Force on a plate, Pressure basics' });
check('quiz: adds a problem written before', await t.locator('.qlist li').count() === 1);
await t.click('button:has-text("Write a new problem for this quiz")'); await t.waitForURL('**/write/problem?quiz=**');
check('quiz: new problem takes the quiz audience', await t.locator('select >> nth=1').isDisabled());
await t.selectOption('label:has-text("Topic") select', { index: 1 });
await t.locator('label:has-text("Title") input').fill('Gauge pressure');
await t.locator('label:has-text("Problem") textarea').fill('Absolute pressure is 150 kPa and the air is 100 kPa. Find the gauge pressure.');
await t.fill('input[aria-label="Choice A"]', '50 kPa'); await t.fill('input[aria-label="Choice B"]', '250 kPa');
await t.check('input[aria-label="A is correct"]');
await t.locator('label:has-text("Hint") textarea').fill('Gauge is absolute minus air.');
await t.fill('textarea[aria-label="Step 1"]', '150 - 100 = 50 kPa.');
await t.click('button:has-text("Save problem")'); await t.waitForURL('**/write/quiz?id=**');
check('quiz: problem written from the quiz is added to it', await t.locator('.qlist li').count() === 2);
await t.click('button:has-text("Save quiz")'); await t.waitForURL(BASE + '/write');
check('quiz: listed under Your quizzes', await t.isVisible('text=2 problems, 10 minutes, Batch Test'));

const outsider = await newUser('outsider');
await outsider.goto(lessonUrl);
check('someone outside the class cannot open the lesson', await outsider.isVisible('text=not found') || (await outsider.title()).toLowerCase().includes('not found') || !(await outsider.isVisible('h1:has-text("Pressure basics")')));

await s.goto(BASE + '/classes'); await s.fill('input[name=code]', code.toLowerCase()); await s.click('button:has-text("Join class")');
await s.waitForSelector('text=You joined Batch Test');
check('student: joins with the code (any case)', true);
await s.goto(BASE + '/subjects/math');
check('student: class lesson appears in Subjects', await s.isVisible('text=Pressure basics'));
await s.click('text=Pressure basics'); await s.waitForURL('**/lesson/**');
await s.click('button:has-text("Practise 1 problems"), button:has-text("Practise 1")'); await s.waitForURL('**/attempt/**');
await s.click('.opts button >> nth=0'); await s.waitForSelector('.fb');
check('student: practises the class problem', (await s.textContent('.fb')).includes('Not yet'));
const qid = decodeURIComponent((await s.evaluate(() => location.href)));
await s.goto(BASE + '/notebook?tab=soon'); await s.click('a.item:has-text("Force on a plate")'); await s.waitForURL('**/review/**');
await s.click('button:has-text("Report a mistake")'); await s.fill('textarea', 'Units should be kPa?'); await s.click('button:has-text("Send report")');
check('student: can report a mistake', await s.waitForSelector('text=will see your report').then(() => true, () => false));

await t.goto(BASE + '/write');
check('instructor: sees the report', await t.isVisible('text=Units should be kPa?'));
await t.click('button:has-text("Done")'); await t.waitForLoadState('networkidle');
check('instructor: resolves the report', !(await t.isVisible('text=Units should be kPa?')));
await t.screenshot({ path: shots + 'f-write.png', fullPage: true });

// Student takes the class quiz, exam style.
await s.goto(BASE + '/subjects');
check('student: class quiz appears in Subjects', await s.isVisible('text=Pressure quiz'));
await s.click('button:has-text("Pressure quiz")'); await s.waitForURL('**/attempt/**');
check('student: quiz shows its title and timer', await s.isVisible('h1:has-text("Pressure quiz 1 of 2")') && await s.isVisible('[role=timer]'));
await s.click('.opts button >> nth=1'); await s.click('button:has-text("Save and next")'); await s.waitForSelector('h1:has-text("Pressure quiz 2 of 2")');
await s.click('.opts button >> nth=0'); await s.click('button:has-text("Save and finish")');
await s.waitForSelector('h1:has-text("%")', { timeout: 15000 });
check('student: quiz ends with a score', (await s.textContent('.vh .sub')).includes('in Pressure quiz'), await s.textContent('h1'));

// 3. Pages render without overflow on a phone.
for (const [p, path] of [[t, '/write'], [t, '/write/problem'], [t, '/write/quiz'], [t, '/classes'], [s, '/subjects'], [s, '/']]) {
  await p.goto(BASE + path);
  const over = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  check(`no sideways scroll on ${path}`, !over);
}
await t.goto(BASE + '/write/problem'); await t.screenshot({ path: shots + 'f-editor.png', fullPage: true });
await s.goto(BASE + '/'); await s.screenshot({ path: shots + 'f-today.png' });

const errs = [...s.errors, ...t.errors, ...outsider.errors];
check('no page errors', errs.length === 0, errs.join(' | '));
console.log(results.join('\n'));
await browser.close();
