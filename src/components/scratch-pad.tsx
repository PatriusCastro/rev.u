'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, Maximize, Minimize, Pen, Trash, Undo2, X } from 'lucide-react';
import { ic } from './ui';

type Stroke = { erase: boolean; points: [number, number][] };

/** Draw-to-solve pad. Sheet on a phone, side panel on wider screens, full screen on request.
 *  The working is not saved: the parent remounts it (key = problem id) for each new problem. */
export function ScratchPad({ problemHtml, figure }: { problemHtml: string; figure: string | null }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(false);
  const [empty, setEmpty] = useState(true);

  const draw = useCallback(() => {
    const cv = canvas.current, ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = getComputedStyle(cv).color;
    for (const s of strokes.current) {
      ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
      ctx.lineWidth = s.erase ? 24 : 2.4;
      ctx.beginPath();
      s.points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      if (s.points.length === 1) ctx.lineTo(s.points[0][0] + 0.1, s.points[0][1]);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    setEmpty(strokes.current.length === 0);
  }, []);

  // Keep the canvas sharp at the device's pixel ratio whenever its box changes size.
  useEffect(() => {
    const cv = canvas.current!;
    const size = () => {
      const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
      if (!r.width || !r.height) return;
      cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
      cv.getContext('2d')!.setTransform(d, 0, 0, d, 0, 0);
      draw();
    };
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    // iPad Safari starts text selection and the magnifier from touches; pointer events still fire after this.
    // Native listener because React's touch listeners are passive and cannot preventDefault.
    const stop = (e: TouchEvent) => e.preventDefault();
    cv.addEventListener('touchstart', stop, { passive: false });
    return () => { ro.disconnect(); cv.removeEventListener('touchstart', stop); };
  }, [draw]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [full]);

  const pos = (e: React.PointerEvent): [number, number] => {
    const r = canvas.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const down = (e: React.PointerEvent) => {
    canvas.current!.setPointerCapture(e.pointerId);
    current.current = { erase: tool === 'eraser', points: [pos(e)] };
    strokes.current.push(current.current);
    draw();
  };
  const move = (e: React.PointerEvent) => { if (current.current) { current.current.points.push(pos(e)); draw(); } };
  const up = () => { current.current = null; };

  return (
    <>
      <button className="fab" onClick={() => setOpen(true)}><Pen {...ic} />Scratch pad</button>
      <div className={'pad' + (open ? ' open' : '') + (full ? ' full' : '')} role={full ? 'dialog' : undefined} aria-label="Scratch pad">
        <div className="padbar">
          <span className="t">Scratch pad</span>
          <button className="tool" aria-pressed={tool === 'pen'} aria-label="Pen" onClick={() => setTool('pen')}><Pen {...ic} /></button>
          <button className="tool" aria-pressed={tool === 'eraser'} aria-label="Eraser" onClick={() => setTool('eraser')}><Eraser {...ic} /></button>
          <button className="tool" aria-label="Undo last stroke" onClick={() => { strokes.current.pop(); draw(); }}><Undo2 {...ic} /></button>
          <button className="tool" aria-label="Clear the pad" onClick={() => { strokes.current = []; draw(); }}><Trash {...ic} /></button>
          <button className="tool" aria-pressed={full} aria-label={full ? 'Exit full screen' : 'Open full screen'} onClick={() => setFull(!full)}>{full ? <Minimize {...ic} /> : <Maximize {...ic} />}</button>
          <button className="tool padclose" aria-label="Close scratch pad" onClick={() => setOpen(false)}><X {...ic} /></button>
        </div>
        <div className="padq">
          <div dangerouslySetInnerHTML={{ __html: problemHtml }} />
          {figure && <div className="fig" dangerouslySetInnerHTML={{ __html: figure }} />}
        </div>
        <div className="padc">
          {empty && <p>Work the problem here with a finger, stylus or mouse. Your working stays while you are on this problem.</p>}
          <canvas ref={canvas} aria-label="Scratch pad drawing area" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
        </div>
      </div>
    </>
  );
}
