import { Sigma, SquareFunction, ChartSpline, TriangleRight, Layers, Dices, Shapes, TrendingUp } from 'lucide-react';

/** Icon props from the design system: 20px, 1.75 stroke, always beside a text label. */
export const ic = { size: 20, strokeWidth: 1.75, 'aria-hidden': true } as const;

const AREA_ICONS: Record<string, typeof Sigma> = { trigonometry: TriangleRight, algebra: Sigma, 'analytic-geometry': ChartSpline, calculus: SquareFunction, probability: Dices, geometry: Shapes, 'differential-equations': TrendingUp };
export function AreaIcon({ topicId }: { topicId: string }) {
  const Icon = AREA_ICONS[topicId.split('/')[0]] ?? Layers;
  return <Icon {...ic} />;
}

/** Progress ring; `value` is 0 to 1. */
export function Ring({ value, label }: { value: number; label: string }) {
  const o = Math.round(132 * (1 - Math.max(0, Math.min(1, value))));
  return (
    <div className="prog">
      <svg viewBox="0 0 52 52" aria-hidden><circle cx="26" cy="26" r="21" /><circle className="v" style={{ ['--o' as string]: o }} cx="26" cy="26" r="21" /></svg>
      <b>{label}</b>
    </div>
  );
}

export const pct = (correct: number, answered: number) => (answered ? Math.round((100 * correct) / answered) : 0);

const STOPS = [['1', '1 day'], ['3', '3 days'], ['7', '7 days'], ['cleared', 'Cleared']] as const;
/** Where a problem is in its 1, 3, 7 day schedule. `stage` is null when it is not in the notebook. */
export function ScheduleTracker({ stage }: { stage: string | null }) {
  return (
    <div className="card sched">
      <h2 className="label">Repeat schedule</h2>
      <div className="trk">
        {STOPS.map(([s, text]) => <span key={s} className={stage === s ? 'on' : undefined} aria-current={stage === s ? 'step' : undefined}>{text}</span>)}
      </div>
    </div>
  );
}

/** Compact schedule for notebook rows: dots filled up to the current interval. */
export function StageDots({ interval }: { interval: number }) {
  const n = interval === 1 ? 1 : interval === 3 ? 2 : 3;
  return (
    <span className="stage">
      <span className="dots" aria-hidden>{[1, 2, 3].map((i) => <i key={i} className={i <= n ? 'f' : undefined} />)}</span>
      {interval === 1 ? '1 day' : `${interval} days`}
    </span>
  );
}
