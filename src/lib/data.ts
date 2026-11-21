import type { SupabaseClient } from '@supabase/supabase-js';
import type { TopicStat } from './plan';

export type Topic = { id: string; subject_id: string; area: string; name: string; minutes: number; sort: number };
export type Subject = { id: string; name: string; weight: number; mock_items: number; mock_minutes: number };
export type Stat = TopicStat & { total: number };

/** Topics and subjects with the reviewer's accuracy per topic (from the topic_progress view). */
export async function topicStats(supabase: SupabaseClient) {
  const [{ data: topics }, { data: subjects }, { data: progress }] = await Promise.all([
    supabase.from('topics').select('id, subject_id, area, name, minutes, sort').order('sort'),
    supabase.from('subjects').select('id, name, weight, mock_items, mock_minutes').order('sort'),
    supabase.from('topic_progress').select('topic_id, total, answered, correct, seen'),
  ]);
  const weight = new Map((subjects ?? []).map((s) => [s.id, Number(s.weight)]));
  const subjectOf = new Map((topics ?? []).map((t) => [t.id, t.subject_id]));
  const stats = new Map<string, Stat>((progress ?? []).map((p) => [p.topic_id, {
    id: p.topic_id, weight: weight.get(subjectOf.get(p.topic_id)) ?? 0,
    answered: p.answered, correct: p.correct, unseen: p.total - p.seen, total: p.total,
  }]));
  return { topics: (topics ?? []) as Topic[], subjects: (subjects ?? []) as Subject[], stats };
}

/** The problem's title, or its file name made readable: "trigonometry/tower-two-points" becomes "Tower two points". */
export function problemTitle(id: string, title?: string | null) {
  if (title) return title;
  const s = id.split('/').pop()!.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
