// Daily review plan, streak and week chart. Pure, so they are unit tested.

export type TopicStat = { id: string; weight: number; answered: number; correct: number; unseen: number };

/** Below this many answers a topic's accuracy is unknown. */
export const MIN_ANSWERS = 5;

// Unknown topics are scored as if half right: ahead of strong topics, behind clearly weak ones.
export function score(t: TopicStat): number {
  const acc = t.answered < MIN_ANSWERS ? 0.5 : t.correct / t.answered;
  return (1 - acc) * t.weight;
}

/** Weakest first, by (1 − accuracy) × subject weight. Topics with nothing left to practise go last. */
export function rankTopics(topics: TopicStat[]): TopicStat[] {
  return [...topics].sort((a, b) => Number(b.unseen > 0) - Number(a.unseen > 0) || score(b) - score(a));
}

/** Unseen problems divided by the days left, rounded up. */
export function dailyTarget(unseen: number, daysLeft: number): number {
  return daysLeft <= 1 ? unseen : Math.ceil(unseen / daysLeft);
}

/** Consecutive days with at least one answer, ending today (or yesterday, if today is still empty). */
export function streak(days: Set<string>, today: string, addDays: (d: string, n: number) => string): number {
  let d = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

/** Monday-to-Sunday day list for the week holding `today`. */
export function weekDays(today: string, addDays: (d: string, n: number) => string): string[] {
  const dow = (new Date(today + 'T00:00:00Z').getUTCDay() + 6) % 7; // Monday = 0
  return Array.from({ length: 7 }, (_, i) => addDays(today, i - dow));
}
