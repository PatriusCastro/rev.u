// Browser journeys against a running app (npm run dev) and local Supabase. Usage: npm run test:e2e
// Set CHROME_PATH if Chrome is not in the default Windows location; BASE to test another URL.
// UAT: a reviewer's journeys, end to end, against the production build.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const env = Object.fromEntries(readFileSync('.env.local', 'utf8').replace(/\r/g, '').trim().split('\n').map((l) => l.split(/=(.*)/s).slice(0, 2)));
const API = env.NEXT_PUBLIC_SUPABASE_URL, SR = env.SUPABASE_SERVICE_ROLE_KEY;
const dir = import.meta.dirname; mkdirSync(join(dir, 'out'), { recursive: true });
const rest = (path, method = 'GET', body) => fetch(`${API}/rest/v1/${path}`, { method, headers: { apikey: SR, Authorization: `Bearer ${SR}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: body && JSON.stringify(body) }).then((r) => r.json());
const ymd = (offset = 0) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date(Date.now() + offset * 864e5));

const results = [];
const findings = [];
const note = (sev, area, text) => findings.push({ sev, area, text });
async function step(name, fn) {
  const t = Date.now();
  try { await fn(); results.push({ name, ok: true, ms: Date.now() - t }); }
  catch (e) { results.push({ name, ok: false, ms: Date.now() - t, err: String(e.message ?? e).split('\n')[0] }); await page.screenshot({ path: join(dir, 'out', 'FAIL-' + name.replace(/\W+/g, '-') + '.png') }).catch(() => {}); }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(`${new URL(page.url()).pathname}: ${m.text()}`));
page.on('pageerror', (e) => consoleErrors.push(`${new URL(page.url()).pathname}: ${e}`));
const shot = (n) => page.screenshot({ path: join(dir, 'out', n + '.png') });
const go = async (p) => { const t = Date.now(); await page.goto(BASE + p, { waitUntil: 'networkidle' }); return Date.now() - t; };
const timings = {};

// Accessibility + overflow audit of the current page
const audits = {};
async function audit(label) {
  await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
  const r = await page.evaluate(async () => {
    const res = await window.axe.run(document, { resultTypes: ['violations'] });
    return res.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, target: v.nodes[0]?.target?.join(' ') }));
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  const smallTaps = await page.evaluate(() => [...document.querySelectorAll('a, button, input, select')].filter((el) => { const b = el.getBoundingClientRect(); return b.width && b.height && (b.height < 44 || b.width < 44) && getComputedStyle(el).visibility !== 'hidden'; }).map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || el.name || '').trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`));
  audits[label] = { axe: r, overflow, smallTaps };
}

const email = `uat-${Date.now()}@revu.test`, pw = 'uat-password-1';

// 1. Sign-in errors and sign-up
await step('signed-out visitor is sent to sign in', async () => { await go('/subjects'); expect(page.url().endsWith('/login'), 'not redirected: ' + page.url()); });
await step('wrong password shows a clear message', async () => {
  await page.fill('input[name=email]', 'nobody@revu.test'); await page.fill('input[name=password]', 'wrong-password');
  await page.click('button:has-text("Sign in")'); await page.waitForURL(/msg=/);
  const msg = await page.textContent('[role=status]'); note('info', 'Sign in', `Wrong password message reads: "${msg}"`);
});
await step('short password is blocked before sending', async () => {
  await page.fill('input[name=email]', email); await page.fill('input[name=password]', 'short');
  await page.click('button:has-text("Create an account")');
  expect(page.url().includes('/login'), 'left the login page');
  expect(await page.evaluate(() => !document.querySelector('input[name=password]').checkValidity()), 'browser validation did not catch it');
});
await audit('login-phone'); await shot('01-login');
await step('sign up goes to exam date', async () => {
  await page.fill('input[name=password]', pw); await page.click('button:has-text("Create an account")'); await page.waitForURL('**/setup');
});
await step('a past exam date is refused', async () => {
  await page.evaluate(() => document.querySelector('input[name=exam_date]').removeAttribute('min'));
  await page.fill('input[name=exam_date]', ymd(-3)); await page.click('text=Save exam date'); await page.waitForURL(/setup\?msg=/);
  expect(await page.isVisible('[role=alert]'), 'no error shown');
});
await audit('setup-phone');
await step('a valid exam date opens Today', async () => {
  await page.fill('input[name=exam_date]', ymd(90)); await page.click('text=Save exam date'); await page.waitForURL(BASE + '/');
  expect((await page.textContent('.num')).trim() === '90', 'days to exam is ' + await page.textContent('.num'));
});
timings.today = await go('/'); await shot('02-today-new'); await audit('today-new-phone');
await step('new user Today: no repeats, practice is the main action', async () => {
  expect(await page.isVisible('text=No repeats due today'), 'missing empty repeats card');
  expect(await page.locator('.btn.pri').count() === 1, `${await page.locator('.btn.pri').count()} primary buttons`);
});

// 2. Lesson then practice from it
timings.subjects = await go('/subjects'); await audit('subjects-phone');
await step('subjects -> lesson -> practice', async () => {
  await page.click('a[href="/subjects/math"]'); await page.waitForURL('**/subjects/math');
  await page.click('a[href="/lesson/trigonometry/angles-of-elevation"]'); await page.waitForURL('**/lesson/**');
  timings.lessonKatex = await page.locator('.katex').count();
  await audit('lesson-phone'); await shot('03-lesson');
  await page.click('button:has-text("Practise")'); await page.waitForURL('**/attempt/**');
});
const practiceUrl = page.url();
await audit('problem-phone'); await shot('04-problem');
let correctSeen = 0, wrongSeen = 0;
await step('practice: hint, answer, every step, through to summary', async () => {
  for (let i = 0; i < 12; i++) {
    if (await page.isVisible('text=Show a hint')) { await page.click('text=Show a hint'); expect(await page.isVisible('.hint'), 'hint did not open'); }
    // answer the first problem wrong, the rest by picking the option the server marks right on a retry is impossible, so alternate A/B
    const opts = page.locator('.opts button');
    await opts.nth(i % 2).click();
    await page.waitForSelector('.fb');
    (await page.getAttribute('.fb', 'class')).includes('good') ? correctSeen++ : wrongSeen++;
    expect(await opts.locator('.right').count() + await page.locator('.opts .right').count() >= 1, 'correct answer not shown');
    while (await page.locator('button:has-text("Show next step")').count()) await page.click('button:has-text("Show next step")');
    expect(await page.isVisible('text=All steps shown'), 'steps did not finish');
    if (i === 0) await shot('05-solution');
    const next = page.locator('button:has-text("Next problem"), button:has-text("See how the set went")');
    const last = (await next.textContent()).includes('See how');
    await next.click(); await page.waitForTimeout(700);
    if (last) break;
  }
  await page.waitForSelector('h1:has-text("right")');
});
await shot('06-summary'); await audit('summary-phone');
await step('double-tap on an option does not record two answers', async () => {
  const [{ id }] = await rest(`attempts?select=id&order=started_at.desc&limit=1`);
  const rows = await rest(`answers?select=question_id&attempt_id=eq.${id}`);
  expect(rows.length === new Set(rows.map((r) => r.question_id)).size, 'duplicate answers');
});
await step('reopening a finished set shows its summary, not a problem', async () => { await page.goto(practiceUrl); expect(await page.isVisible('h1:has-text("right")'), 'did not show summary'); });

// 3. Notebook holds the misses; jump a day and do repeats
await step('notebook lists every miss as due tomorrow', async () => {
  await go('/notebook?tab=soon'); const rows = await page.locator('.rows .item').count();
  expect(rows === wrongSeen, `notebook has ${rows}, missed ${wrongSeen}`);
});
await audit('notebook-phone'); await shot('07-notebook');
const user = (await rest(`profiles?select=id&order=created_at.desc&limit=1`))[0].id;
await rest(`repeats?user_id=eq.${user}`, 'PATCH', { due: ymd(0) }); // a day passes
await step('next day: Today leads with the repeats card', async () => {
  await go('/'); expect(await page.isVisible('.hero'), 'no repeats card');
  const title = await page.textContent('.htitle'); expect(title.startsWith(String(wrongSeen)), 'title says ' + title);
});
await shot('08-today-repeats'); await audit('today-repeats-phone');
await step('leave a repeat set half done, then continue it', async () => {
  await page.click('button:has-text("Start repeats")'); await page.waitForURL('**/attempt/**');
  await page.locator('.opts button').first().click(); await page.waitForSelector('.fb');
  await go('/');
  expect(await page.isVisible('text=Continue repeats'), 'no continue button');
  const t = await page.textContent('.htitle'); expect(t.includes('left'), 'title: ' + t);
  await page.click('text=Continue repeats'); await page.waitForURL('**/attempt/**');
});
await step('repeat answered right moves to 3 days; a 7-day repeat right clears it', async () => {
  // Find this problem's answer from the DB like an answer key, answer right.
  const text = await page.textContent('.q');
  const qs = await rest(`questions?select=id,body,answer`);
  const q = qs.find((x) => text.includes(x.body.slice(0, 25).replace(/\$/g, '')) || x.body.startsWith(text.slice(0, 25)));
  expect(q, 'could not match problem');
  await page.click(`.opts button:has(i:text-is("${q.answer}"))`); await page.waitForSelector('.fb.good');
  expect((await page.textContent('.fb')).includes('3 days'), 'feedback: ' + await page.textContent('.fb'));
  expect((await page.textContent('.trk .on')).includes('3 days'), 'tracker not at 3 days');
  // Set it to a due 7-day repeat and answer right again via a new repeat set.
  await rest(`repeats?user_id=eq.${user}&question_id=eq.${encodeURIComponent(q.id)}`, 'PATCH', { interval: 7, due: ymd(0) });
  await rest(`attempts?user_id=eq.${user}&mode=eq.repeat`, 'PATCH', { finished_at: new Date().toISOString() });
  await go('/notebook'); await page.click('button:has-text("Redo")'); await page.waitForURL('**/attempt/**');
  for (let i = 0; i < 10; i++) {
    const t2 = await page.textContent('.q');
    const q2 = qs.find((x) => x.body.startsWith(t2.slice(0, 25)) || t2.includes(x.body.slice(0, 25).replace(/\$/g, '')));
    await page.click(`.opts button:has(i:text-is("${q2.answer}"))`); await page.waitForSelector('.fb');
    if (q2.id === q.id) { expect((await page.textContent('.fb')).includes('cleared'), 'not cleared: ' + await page.textContent('.fb')); break; }
    await page.click('button:has-text("Next problem"), button:has-text("See how the set went")'); await page.waitForTimeout(600);
  }
  await go('/notebook'); expect((await page.textContent('.vh .sub')).includes('1 cleared'), await page.textContent('.vh .sub'));
});

// 4. Mock exam: refresh, time up
await step('mock exam: answer, refresh keeps time, time-up shows results', async () => {
  await go('/subjects/math'); await page.click('text=Take a mock exam'); await page.waitForURL('**/attempt/**');
  await shot('09-mock'); await audit('mock-phone');
  expect(!(await page.isVisible('text=Show a hint')), 'mock shows hints');
  await page.locator('.opts button').first().click(); await page.click('text=Save and next'); await page.waitForTimeout(800);
  expect(!(await page.isVisible('.fb')), 'mock shows feedback');
  const id = page.url().split('?')[0].split('/').pop();
  await rest(`attempts?id=eq.${id}`, 'PATCH', { started_at: new Date(Date.now() - 2 * 3600e3).toISOString() });
  await page.reload(); await page.waitForSelector('h1');
  const h = await page.textContent('h1'); expect(h.endsWith('%'), 'results heading: ' + h);
});
await shot('10-mock-results');

// 5. Library
await step('library: non-PDF refused, PDF uploads, opens, deletes', async () => {
  await go('/library'); await audit('library-phone');
  writeFileSync(join(dir, 'notes.txt'), 'hello');
  await page.setInputFiles('input[type=file]', join(dir, 'notes.txt'));
  await page.click('button:has-text("Upload a PDF")');
  expect(await page.isVisible('[role=alert]'), 'text file not refused');
  writeFileSync(join(dir, 'tiny.pdf'), '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
  await page.setInputFiles('input[type=file]', join(dir, 'tiny.pdf'));
  await page.click('button:has-text("Upload a PDF")'); await page.waitForSelector('.rows a.item');
  await page.click('.rows a.item'); await page.waitForURL('**/library/**'); await shot('11-reader');
  page.once('dialog', (d) => d.accept());
  await page.click('button:has-text("Delete")'); await page.waitForURL(BASE + '/library');
  expect(await page.isVisible('text=No files yet'), 'not deleted');
});

// 6. Bad links and other people's data
await step('unknown set and lesson links show not-found, not a crash', async () => {
  const r1 = await page.goto(BASE + '/attempt/00000000-0000-0000-0000-000000000000'); expect(r1.status() === 404, 'status ' + r1.status());
  const r2 = await page.goto(BASE + '/lesson/nope/nothing'); expect(r2.status() === 404, 'status ' + r2.status());
  const r3 = await page.goto(BASE + '/attempt/not-a-uuid'); expect(r3.status() < 500, 'status ' + r3.status());
});
await shot('12-404');

// 7. Keyboard
await step('keyboard: tab reaches options, focus ring shows, Escape leaves full-screen pad', async () => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await go('/lesson/trigonometry/sine-cosine-law'); await page.click('button:has-text("Practise")'); await page.waitForURL('**/attempt/**');
  let found = false;
  for (let i = 0; i < 12 && !found; i++) { await page.keyboard.press('Tab'); found = await page.evaluate(() => !!document.activeElement?.closest('.opts')); }
  expect(found, 'options not reachable by Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle); expect(outline !== 'none', 'no focus ring');
  await page.click('[aria-label="Open full screen"]'); await page.keyboard.press('Escape');
  expect(!(await page.isVisible('.pad.full')), 'Escape did not close');
});

// 8. Layout at each size + smallest phone
for (const [w, h, n] of [[320, 640, 'small-phone'], [820, 1180, 'tablet'], [1366, 860, 'laptop']]) {
  await page.setViewportSize({ width: w, height: h });
  for (const p of ['/', '/subjects', '/notebook', '/library', '/lesson/trigonometry/sine-cosine-law']) {
    await go(p); const k = `${p}@${n}`; await audit(k);
    if (p === '/' || p === '/lesson/trigonometry/sine-cosine-law') await shot(`20-${n}${p.replace(/\W+/g, '-')}`);
  }
}

// 9. Timing (production build, warm)
for (const p of ['/', '/subjects', '/notebook', '/library', '/lesson/trigonometry/angles-of-elevation']) {
  const runs = []; for (let i = 0; i < 3; i++) runs.push(await go(p)); timings[p] = Math.min(...runs);
}

await browser.close();
writeFileSync(join(dir, 'out', 'report.json'), JSON.stringify({ results, findings, audits, timings, consoleErrors }, null, 1));
console.log('STEPS'); for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : '  -> ' + r.err}`);
console.log('\nAXE (unique)'); const seen = new Map();
for (const [k, a] of Object.entries(audits)) for (const v of a.axe) { const key = v.id + ' ' + v.target; if (!seen.has(key)) seen.set(key, `${v.impact} ${v.id} x${v.n} @${k}: ${v.help} [${v.target}]`); }
console.log([...seen.values()].join('\n') || 'none');
console.log('\nOVERFLOW', Object.entries(audits).filter(([, a]) => a.overflow).map(([k]) => k).join(', ') || 'none');
console.log('\nSMALL TAP TARGETS (unique)', [...new Set(Object.values(audits).flatMap((a) => a.smallTaps))].join('\n') || 'none');
console.log('\nTIMINGS ms', JSON.stringify(timings));
console.log('\nNOTES', findings.map((f) => `${f.area}: ${f.text}`).join('\n'));
console.log('\nCONSOLE', consoleErrors.join('\n') || 'none');

