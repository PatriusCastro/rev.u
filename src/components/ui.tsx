import { Sigma, SquareFunction, ChartSpline, TriangleRight, Layers, Dices, Shapes, TrendingUp, Droplets, Mountain, Building2, Compass, Route } from 'lucide-react';

/** Icon props from the design system: 20px, 1.75 stroke, always beside a text label. */
export const ic = { size: 20, strokeWidth: 1.75, 'aria-hidden': true } as const;

const AREA_ICONS: Record<string, typeof Sigma> = { trigonometry: TriangleRight, algebra: Sigma, 'analytic-geometry': ChartSpline, calculus: SquareFunction, probability: Dices, geometry: Shapes, 'differential-equations': TrendingUp, hydraulics: Droplets, geotechnical: Mountain, structural: Building2, surveying: Compass, transportation: Route };
export function AreaIcon({ topicId }: { topicId: string }) {
  const Icon = AREA_ICONS[topicId.split('/')[0]] ?? Layers;
  return <Icon {...ic} />;
}

/** The Rev.U mark: a U drawn as a U-turn arrow (going back over what you missed), with an amber dot.
 *  Same shapes as src/app/icon.svg and apple-icon.tsx. */
export const MARK_PATHS = { u: 'M40 17v17a10 10 0 0 1-20 0V22', arrow: 'M13.5 27.5 20 20l6.5 7.5' };
export function Mark({ size = 36 }: { size?: number }) {
  return (
    <span className="mark" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 64 64">
        <g fill="none" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round"><path d={MARK_PATHS.u} /><path d={MARK_PATHS.arrow} /></g>
        <circle cx="49" cy="45" r="4.5" fill="#f5b21a" />
      </svg>
    </span>
  );
}
export function Logo({ size = 36 }: { size?: number }) {
  return <span className="logo" style={{ fontSize: size * 0.62 }}><Mark size={size} /><span>Rev<i>.</i>U</span></span>;
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
