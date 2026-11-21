// Spaced repeat rule and the day arithmetic it depends on. Pure, so it is unit tested.

export type Interval = 1 | 3 | 7;

/** New interval after an answer, 'cleared', or null when the notebook does not change. */
export function nextStage(current: Interval | null, correct: boolean, due: boolean): Interval | 'cleared' | null {
  if (!correct) return 1;
  if (current === null || !due) return null;
  return current === 1 ? 3 : current === 3 ? 7 : 'cleared';
}

// shortcut: every user is on Philippine time; store a per-user time zone if reviewers abroad join.
const TZ = 'Asia/Manila';

/** Calendar day as YYYY-MM-DD in the app's time zone. */
export function dayOf(d: Date | string = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(d));
}

export function addDays(day: string, n: number): string {
  const d = new Date(day + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400000);
}
