import React, { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Polygon, Rect } from 'react-native-svg';
import { DEMOS } from '../anim/demos';
import { cycleMs, shapesAt, VIEWBOX, type Demo, type Shape, type Tone } from '../anim/rig';
import { usePalette, type Palette } from '../theme';

function toneColor(P: Palette, t: Tone, bg: string): string {
  switch (t) {
    case 'body': return P.body;
    case 'bodyFar': return P.bodyFar;
    case 'hl': return P.hl;
    case 'hlFar': return P.hlFar;
    case 'prop': return P.prop;
    case 'propSoft': return P.propSoft;
    case 'floor': return P.line;
    case 'plate': return P.accent;
    case 'cable': return P.prop;
    case 'bg': return bg;
  }
}

function ShapeEl({ s, P, bg }: { s: Shape; P: Palette; bg: string }) {
  const c = (t: Tone | undefined) => (t ? toneColor(P, t, bg) : 'none');
  switch (s.k) {
    case 'line': return <Line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={c(s.c)} strokeWidth={s.w} strokeLinecap="round" />;
    case 'circle': return <Circle cx={s.cx} cy={s.cy} r={s.r} fill={c(s.fill)} stroke={c(s.stroke)} strokeWidth={s.sw ?? 0} />;
    case 'ellipse': return <Ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={c(s.fill)} transform={`rotate(${s.rot} ${s.cx} ${s.cy})`} />;
    case 'rect': return <Rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r} fill={c(s.fill)} />;
    case 'poly': return <Polygon points={s.pts.map((p) => p.join(',')).join(' ')} fill={c(s.fill)} />;
  }
}

/** Static frame of a demo (used for list thumbnails). */
export function FigureStill({ id, size, bg, at = 0.5 }: { id: string; size: number; bg: string; at?: number }) {
  const P = usePalette();
  const demo = DEMOS[id];
  if (!demo) return null;
  const shapes = shapesAt(demo, demo.durs[0] * at);
  return (
    <Svg width={size} height={size * (206 / 240)} viewBox={VIEWBOX}>
      <G>{shapes.map((s, i) => <ShapeEl key={i} s={s} P={P} bg={bg} />)}</G>
    </Svg>
  );
}

/** Looping animated demo. Pauses when the app is in the background. */
export function FigureLoop({ id, width, bg, speed = 1 }: { id: string; width: number; bg: string; speed?: number }) {
  const P = usePalette();
  const demo: Demo | undefined = DEMOS[id];
  const [ms, setMs] = useState(0);
  const raf = useRef<number | null>(null);
  const t0 = useRef<number | null>(null);
  const offset = useRef(0);
  const active = useRef(true);

  useEffect(() => {
    if (!demo) return;
    let last = 0;
    const loop = (now: number) => {
      if (t0.current == null) t0.current = now;
      if (active.current && now - last > 30) {
        last = now;
        setMs(offset.current + (now - t0.current) * speed);
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    const sub = AppState.addEventListener('change', (s) => { active.current = s === 'active'; });
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      sub.remove();
    };
  }, [demo, speed]);

  // keep the phase when speed changes
  useEffect(() => { offset.current = ms; t0.current = null; }, [speed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!demo) return null;
  const shapes = shapesAt(demo, ms % cycleMs(demo));
  return (
    <Svg width={width} height={width * (206 / 240)} viewBox={VIEWBOX}>
      <G>{shapes.map((s, i) => <ShapeEl key={i} s={s} P={P} bg={bg} />)}</G>
    </Svg>
  );
}

export const hasDemo = (id: string) => !!DEMOS[id];
