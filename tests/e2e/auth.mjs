// Sign-in options against a running app and local Supabase with its mail catcher (Mailpit). Part of npm run test:e2e.
import { chromium } from 'playwright-core';
const BASE = process.env.BASE ?? 'http://localhost:3000';
const MAIL = process.env.MAIL ?? 'http://127.0.0.1:54324';
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

// 2. Signing out: a clear message, and the email is filled in for next time.
await step('sign out', async () => {
  await a.click('button[aria-label="Sign out"]'); await a.waitForURL(/\/login\?msg=signed_out/);
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
  await a.click('button[aria-label="Sign out"]'); await a.waitForURL(/\/login/);
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

errors.push(...a.errors, ...b.errors);
check('no page errors', errors.length === 0, errors.join(' | '));
console.log(results.join('\n'));
await browser.close();
if (results.some((r) => r.startsWith('FAIL'))) process.exit(1);
