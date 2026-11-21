// Sign-in options against a running app and local Supabase with its mail catcher (Mailpit). Part of npm run test:e2e.
import { chromium } from 'playwright-core';
const BASE = process.env.BASE ?? 'http://localhost:3000';
const MAIL = process.env.MAIL ?? 'http://127.0.0.1:54324';
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? (await import('node:fs')).readFileSync(import.meta.dirname + '/../../.env.local', 'utf8').match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const results = [];
const check = (name, ok, extra = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`); };
const fresh = async () => { const p = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage(); p.errors = []; p.on('pageerror', (e) => p.errors.push(String(e))); return p; };

// The newest email to an address, from Mailpit's API.
async function mail(to, subject = '') {
  for (let i = 0; i < 20; i++) {
    const r = await (await fetch(`${MAIL}/api/v1/search?query=${encodeURIComponent('to:' + to + (subject && ' subject:' + subject))}&limit=1`)).json();
    if (r.messages?.length) return (await fetch(`${MAIL}/api/v1/message/${r.messages[0].ID}`)).json();
    await new Promise((ok) => setTimeout(ok, 500));
  }
  throw new Error('no email for ' + to);
}
const ymd = (o) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date(Date.now() + o * 864e5));
const errors = [];
// save: keep the account on this browser for one-tap sign-in (ticked by default in the dialog).
const signOutNow = async (p, save = false) => { await p.click('button[aria-label="Sign out"]'); await p.setChecked('dialog.sheet input[name=save]', save); await p.click('dialog.sheet button:has-text("Sign out")'); };
const step = async (name, fn) => { try { await fn(); } catch (e) { check(name, false, String(e).split('\n')[0]); } };

// 1. A new person signs up with a code, no password.
const email = `code-${Date.now()}@revu.test`;
const a = await fresh();
await step('code sign-up', async () => {
  await a.goto(BASE + '/login'); await a.click('text=Email me a sign-in code'); await a.waitForURL(/mode=code/);
  await a.fill('input[name=email]', email); await a.click('button:has-text("Email me a code")');
  await a.waitForSelector('input[name=code]');
  await a.fill('input[name=code]', '000000'); await a.click('button:has-text("Sign in")'); await a.waitForSelector('p.alert');
  check('wrong code is refused with a message', (await a.textContent('p.alert')).includes('wrong or has expired'));
  const code = (await mail(email)).Text.match(/\b\d{6}\b/)[0];
  await a.fill('input[name=code]', code); await a.click('button:has-text("Sign in")'); await a.waitForURL('**/setup');
  check('right code creates the account and asks for the exam date', true);
  await a.fill('input[name=exam_date]', ymd(90)); await a.click('text=Save exam date'); await a.waitForURL(BASE + '/');
});

// 2. Signing out: asks first; cancelling keeps you signed in. Then a clear message, and the email is filled in for next time.
await step('sign out', async () => {
  await a.click('button[aria-label="Sign out"]');
  check('sign out asks first', await a.locator('dialog.sheet[open]').isVisible());
  check('the dialog starts on Cancel, so Enter does not sign out', await a.evaluate(() => document.activeElement?.textContent === 'Cancel'));
  await a.keyboard.press('Escape');
  check('Escape closes it', (await a.locator('dialog.sheet[open]').count()) === 0);
  await a.click('button[aria-label="Sign out"]'); await a.click('dialog.sheet button:has-text("Cancel")');
  check('cancelling keeps you signed in', (await a.locator('dialog.sheet[open]').count()) === 0 && a.url() === BASE + '/');
  await signOutNow(a); await a.waitForURL(/\/login\?msg=signed_out/);
  check('sign out says so', (await a.textContent('[role=status]')).includes('signed out'));
  check('sign-in form remembers the email', (await a.inputValue('input[name=email]')) === email);
  await a.goto(BASE + '/'); check('signed out for real', a.url().includes('/login'));
});

// 3. Forgot password: link by email, set a new one, sign in with it.
await step('reset password', async () => {
  await a.goto(BASE + '/login'); await a.click('text=Forgot password?'); await a.waitForURL(/mode=reset/);
  await a.fill('input[name=email]', email); await a.click('button:has-text("Send reset link")');
  await a.waitForSelector('text=Check your email');
  const link = (await mail(email, 'Reset')).HTML.match(/href="([^"]*type=recovery[^"]*)"/)[1].replaceAll('&amp;', '&').replace('http://127.0.0.1:3000', BASE);
  await a.goto(link); await a.waitForURL('**/reset-password');
  await a.fill('input[name=password]', 'short'); await a.evaluate(() => document.querySelector('input[name=password]').removeAttribute('minlength'));
  await a.click('button:has-text("Save new password")'); await a.waitForSelector('p.alert');
  check('new password must be 8+ characters', (await a.textContent('p.alert')).includes('at least 8'));
  await a.fill('input[name=password]', 'brand-new-pass-1'); await a.click('button:has-text("Save new password")'); await a.waitForURL(BASE + '/');
  await signOutNow(a); await a.waitForURL(/\/login/);
  await a.fill('input[name=password]', 'brand-new-pass-1'); await a.click('button:has-text("Sign in")'); await a.waitForURL(BASE + '/');
  check('signs in with the new password', true);
  await a.goto(link); await a.waitForURL(/msg=expired/);
  check('a used reset link is refused', (await a.textContent('[role=status]')).includes('expired'));
});

// 4. Reset for an unknown email looks the same, so the form does not reveal who has an account.
const b = await fresh();
await step('reset unknown email', async () => {
  await b.goto(BASE + '/login?mode=reset'); await b.fill('input[name=email]', `nobody-${Date.now()}@revu.test`);
  await b.click('button:has-text("Send reset link")'); await b.waitForSelector('text=Check your email');
  check('unknown email gets the same answer', true);
  await b.goto(BASE + '/login?msg=<b>call+us</b>');
  check('login ignores made-up messages', (await b.locator('[role=status]').count()) === 0);
});


// 5. One-tap sign-in: sign out with "save", tap the account to come back; remove it and its session ends.
await step('one-tap sign-in', async () => {
  const p = await fresh();
  const savedToken = async () => JSON.parse(decodeURIComponent((await p.context().cookies()).find((c) => c.name === 'revu_saved')?.value ?? '[]'))[0]?.token;
  const refreshWorks = async (token) => (await fetch(`${process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: token }) })).ok;
  await p.goto(BASE + '/login'); await p.fill('input[name=email]', email); await p.fill('input[name=password]', 'brand-new-pass-1');
  await p.click('button:has-text("Sign in")'); await p.waitForURL(BASE + '/');
  await signOutNow(p, true); await p.waitForURL(/msg=saved/);
  check('saved account is listed after signing out', await p.locator(`button[aria-label="Continue as ${email}"]`).isVisible());
  const token = await savedToken();
  check('the saved token never reaches the page', !!token && !(await p.content()).includes(token));
  await p.goto(BASE + '/subjects'); check('signed out until tapped', p.url().includes('/login'));
  await p.click(`button[aria-label="Continue as ${email}"]`); await p.waitForURL(BASE + '/');
  check('one tap signs back in', true);
  await signOutNow(p, true); await p.waitForURL(/msg=saved/);
  const token2 = await savedToken();
  await p.click(`button[aria-label="Remove ${email} from this device"]`); await p.waitForURL(BASE + '/login');
  check('removed account leaves the list, showing the normal form', (await p.locator('input[name=password]').count()) === 1);
  check('removing it ends that session on the server', !(await refreshWorks(token2)));
  errors.push(...p.errors); await p.context().close();
});

errors.push(...a.errors, ...b.errors);
check('no page errors', errors.length === 0, errors.join(' | '));
console.log(results.join('\n'));
await browser.close();
if (results.some((r) => r.startsWith('FAIL'))) process.exit(1);
