/**
 * A small 2D figure rig for exercise demos.
 *
 * Side view: the figure faces +x (right). Angles are degrees.
 *  - torso: from vertical-up, + leans forward
 *  - fk limb angles: from straight down, + swings forward
 *  - ik limbs: a target point for the hand/ankle, the elbow/knee is solved (bend: +1 / -1 picks the side)
 * Front view: the figure faces the viewer; arm/leg angles are measured outward from straight down.
 * Everything renders to plain shape records so the same code drives react-native-svg and the QA harness.
 */
export type V2 = [number, number];
export type Tone = 'body' | 'bodyFar' | 'hl' | 'hlFar' | 'prop' | 'propSoft' | 'floor' | 'plate' | 'cable' | 'bg';

export type Limb = { ik: V2; bend?: number } | { fk: [number, number]; rel?: boolean };

export type SidePose = {
  hip: V2;
  torso: number;
  head?: number;
  armN: Limb;
  armF?: Limb;
  legN: Limb;
  legF?: Limb;
  /** absolute foot angle in screen degrees (0 = toes pointing right, -90 = up) */
  footN?: number;
  footF?: number;
  /** offset the far limbs are drawn at (depth cue) */
  far?: V2;
  /** lying face down: the body's front faces the floor */
  flip?: boolean;
};

export type FrontArm = { abd: number; hz?: number; elbow?: number };
export type FrontLeg = { abd: number; spread?: number };
export type FrontPose = {
  cx: number;
  hipY: number;
  armL: FrontArm;
  armR: FrontArm;
  legL: FrontLeg;
  legR: FrontLeg;
  seated?: boolean;
  shrug?: number;
};

export type Ref = 'handN' | 'handF' | 'handL' | 'handR' | 'elbowN' | 'ankleN' | 'ankleF' | 'toeN' | 'kneeN' | 'kneeL' | 'kneeR' | 'hip' | 'shoulder' | 'chest' | V2;

export type Prop =
  | { t: 'rect'; x: number; y: number; w: number; h: number; r?: number; tone?: Tone }
  | { t: 'line'; a: V2; b: V2; w?: number; tone?: Tone }
  | { t: 'circle'; c: V2; r: number; tone?: Tone; ring?: boolean }
  | { t: 'cable'; from: V2; to: Ref }
  | { t: 'lever'; from: V2; to: Ref; w?: number }
  | { t: 'roller'; at: Ref; r?: number }
  | { t: 'plate'; at: Ref; w?: number; h?: number }
  | { t: 'barbell'; at: Ref; r?: number }
  | { t: 'dumbbell'; at: Ref }
  | { t: 'grip'; at: Ref }
  | { t: 'platform'; at: Ref; angle: number; len: number; off?: V2 };

export type Muscle =
  | 'chest' | 'lats' | 'traps' | 'lowerBack' | 'abs' | 'glutes' | 'shoulders' | 'rearDelt'
  | 'biceps' | 'triceps' | 'forearms' | 'quads' | 'hamstrings' | 'calves' | 'abductors' | 'midBack';

export type Demo = {
  view: 'side' | 'front';
  frames: (SidePose | FrontPose)[];
  /** ms for each transition i -> i+1; the last one returns to frame 0 */
  durs: number[];
  /** props drawn behind the figure */
  back?: Prop[];
  /** props drawn in front of the figure */
  front?: Prop[];
  hl: Muscle[];
  /** which side view limbs carry the highlight; default both */
};

export type Shape =
  | { k: 'line'; x1: number; y1: number; x2: number; y2: number; w: number; c: Tone }
  | { k: 'circle'; cx: number; cy: number; r: number; fill?: Tone; stroke?: Tone; sw?: number }
  | { k: 'ellipse'; cx: number; cy: number; rx: number; ry: number; rot: number; fill: Tone }
  | { k: 'rect'; x: number; y: number; w: number; h: number; r: number; fill: Tone }
  | { k: 'poly'; pts: V2[]; fill: Tone };

// ---------- geometry ----------
export const LEN = { torso: 46, neck: 7, head: 9, upper: 28, fore: 25, thigh: 40, shin: 38, foot: 14 };
const rad = (d: number) => (d * Math.PI) / 180;
const add = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]];
const scale = (a: V2, s: number): V2 => [a[0] * s, a[1] * s];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpV = (a: V2, b: V2, t: number): V2 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const downDir = (deg: number): V2 => [Math.sin(rad(deg)), Math.cos(rad(deg))];
const upDir = (deg: number): V2 => [Math.sin(rad(deg)), -Math.cos(rad(deg))];
const screenDir = (deg: number): V2 => [Math.cos(rad(deg)), Math.sin(rad(deg))];

function ik2(root: V2, target: V2, l1: number, l2: number, bend: number): [V2, V2] {
  const dx = target[0] - root[0], dy = target[1] - root[1];
  const d = Math.hypot(dx, dy);
  const dc = Math.min(l1 + l2 - 0.01, Math.max(Math.abs(l1 - l2) + 0.01, d));
  const base = Math.atan2(dy, dx);
  const cosA = (l1 * l1 + dc * dc - l2 * l2) / (2 * l1 * dc);
  const a = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const ang = base + bend * a;
  const j: V2 = [root[0] + l1 * Math.cos(ang), root[1] + l1 * Math.sin(ang)];
  const ex = target[0] - j[0], ey = target[1] - j[1];
  const el = Math.hypot(ex, ey) || 1;
  return [j, [j[0] + (ex / el) * l2, j[1] + (ey / el) * l2]];
}

function solveLimb(root: V2, limb: Limb, l1: number, l2: number, torso: number, defBend: number): [V2, V2] {
  if ('ik' in limb) return ik2(root, limb.ik, l1, l2, limb.bend ?? defBend);
  const off = limb.rel ? torso : 0;
  const j = add(root, scale(downDir(limb.fk[0] + off), l1));
  return [j, add(j, scale(downDir(limb.fk[1] + off), l2))];
}

// ---------- interpolation ----------
function lerpLimb(a: Limb, b: Limb, t: number): Limb {
  if ('ik' in a && 'ik' in b) return { ik: lerpV(a.ik, b.ik, t), bend: a.bend };
  if ('fk' in a && 'fk' in b) return { fk: [lerp(a.fk[0], b.fk[0], t), lerp(a.fk[1], b.fk[1], t)], rel: a.rel };
  return t < 0.5 ? a : b;
}
const optLimb = (a: Limb | undefined, b: Limb | undefined, t: number) => (a && b ? lerpLimb(a, b, t) : a ?? b);
const optNum = (a: number | undefined, b: number | undefined, t: number) => (a != null && b != null ? lerp(a, b, t) : a ?? b);

function lerpSide(a: SidePose, b: SidePose, t: number): SidePose {
  return {
    hip: lerpV(a.hip, b.hip, t), torso: lerp(a.torso, b.torso, t), head: optNum(a.head, b.head, t),
    armN: lerpLimb(a.armN, b.armN, t), armF: optLimb(a.armF, b.armF, t),
    legN: lerpLimb(a.legN, b.legN, t), legF: optLimb(a.legF, b.legF, t),
    footN: optNum(a.footN, b.footN, t), footF: optNum(a.footF, b.footF, t), far: a.far, flip: a.flip,
  };
}
const lerpArm = (a: FrontArm, b: FrontArm, t: number): FrontArm => ({ abd: lerp(a.abd, b.abd, t), hz: lerp(a.hz ?? 0, b.hz ?? 0, t), elbow: lerp(a.elbow ?? 0, b.elbow ?? 0, t) });
const lerpLeg = (a: FrontLeg, b: FrontLeg, t: number): FrontLeg => ({ abd: lerp(a.abd, b.abd, t), spread: lerp(a.spread ?? 0, b.spread ?? 0, t) });
function lerpFront(a: FrontPose, b: FrontPose, t: number): FrontPose {
  return {
    cx: lerp(a.cx, b.cx, t), hipY: lerp(a.hipY, b.hipY, t),
    armL: lerpArm(a.armL, b.armL, t), armR: lerpArm(a.armR, b.armR, t),
    legL: lerpLeg(a.legL, b.legL, t), legR: lerpLeg(a.legR, b.legR, t),
    seated: a.seated, shrug: lerp(a.shrug ?? 0, b.shrug ?? 0, t),
  };
}

const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

export function cycleMs(demo: Demo): number {
  return demo.durs.reduce((a, b) => a + b, 0);
}

/** Pose at time ms (loops). */
export function poseAt(demo: Demo, ms: number): SidePose | FrontPose {
  const total = cycleMs(demo);
  let t = ((ms % total) + total) % total;
  const n = demo.frames.length;
  for (let i = 0; i < demo.durs.length; i++) {
    const d = demo.durs[i];
    if (t <= d || i === demo.durs.length - 1) {
      const a = demo.frames[i % n], b = demo.frames[(i + 1) % n];
      const k = d ? ease(Math.min(1, t / d)) : 1;
      return demo.view === 'side' ? lerpSide(a as SidePose, b as SidePose, k) : lerpFront(a as FrontPose, b as FrontPose, k);
    }
    t -= d;
  }
  return demo.frames[0];
}

// ---------- solving ----------
type Pts = Record<string, V2>;

export function solveSide(p: SidePose): Pts {
  const hip = p.hip;
  const shoulder = add(hip, scale(upDir(p.torso), LEN.torso));
  const headC = add(shoulder, scale(upDir(p.torso + (p.head ?? 0)), LEN.neck + LEN.head));
  const neck = add(shoulder, scale(upDir(p.torso + (p.head ?? 0)), LEN.neck));
  const far = p.far ?? [-4, -1];
  const [elbowN, handN] = solveLimb(shoulder, p.armN, LEN.upper, LEN.fore, p.torso, 1);
  const [elbowF0, handF0] = solveLimb(shoulder, p.armF ?? p.armN, LEN.upper, LEN.fore, p.torso, 1);
  const [kneeN, ankleN] = solveLimb(hip, p.legN, LEN.thigh, LEN.shin, p.torso, -1);
  const [kneeF0, ankleF0] = solveLimb(hip, p.legF ?? p.legN, LEN.thigh, LEN.shin, p.torso, -1);
  const toeN = add(ankleN, scale(screenDir(p.footN ?? 0), LEN.foot));
  const toeF0 = add(ankleF0, scale(screenDir(p.footF ?? p.footN ?? 0), LEN.foot));
  const sF = add(shoulder, far), hF = add(hip, far);
  const shift = (v: V2) => add(v, far);
  const chest = add(lerpV(hip, shoulder, 0.78), scale(screenDir(p.torso), 6));
  return {
    hip, shoulder, headC, neck, elbowN, handN, kneeN, ankleN, toeN, chest,
    shoulderF: sF, hipF: hF, elbowF: shift(elbowF0), handF: shift(handF0), kneeF: shift(kneeF0), ankleF: shift(ankleF0), toeF: shift(toeF0),
  };
}

export function solveFront(p: FrontPose): Pts {
  const sh = 13, hw = 8, torsoLen = LEN.torso;
  const shrug = p.shrug ?? 0;
  const pelvis: V2 = [p.cx, p.hipY];
  const chestY = p.hipY - torsoLen;
  const shoulderL: V2 = [p.cx - sh, chestY - shrug];
  const shoulderR: V2 = [p.cx + sh, chestY - shrug];
  const neck: V2 = [p.cx, chestY - 5];
  const headC: V2 = [p.cx, chestY - 5 - LEN.head - 2];
  const arm = (s: V2, a: FrontArm, side: -1 | 1): [V2, V2] => {
    // abd: 0 down, 90 horizontal; hz foreshortens the horizontal reach as the arm points at the viewer
    const hz = rad(a.hz ?? 0);
    const ab = rad(a.abd);
    const ex = Math.sin(ab) * Math.cos(hz) * LEN.upper * side;
    const ey = Math.cos(ab) * LEN.upper;
    const elbow: V2 = [s[0] + ex, s[1] + ey];
    // forearm: continues the arm, then bends up by `elbow` degrees (toward vertical)
    const fa = rad(a.abd + (a.elbow ?? 0));
    const fx = Math.sin(fa) * Math.cos(hz) * LEN.fore * side;
    const fy = Math.cos(fa) * LEN.fore;
    return [elbow, [elbow[0] + fx, elbow[1] + fy]];
  };
  const [elbowL, handL] = arm(shoulderL, p.armL, -1);
  const [elbowR, handR] = arm(shoulderR, p.armR, 1);
  const hipL: V2 = [p.cx - hw, p.hipY], hipR: V2 = [p.cx + hw, p.hipY];
  const leg = (h: V2, l: FrontLeg, side: -1 | 1): [V2, V2] => {
    if (p.seated) {
      // thighs point at the viewer: short projected thigh, knee spreads with `spread`
      const sp = rad(l.spread ?? 0);
      const knee: V2 = [h[0] + side * (4 + Math.sin(sp) * LEN.thigh * 0.85), h[1] + 8];
      return [knee, [knee[0] + side * 2, knee[1] + LEN.shin]];
    }
    const a = rad(l.abd);
    const knee: V2 = [h[0] + side * Math.sin(a) * LEN.thigh, h[1] + Math.cos(a) * LEN.thigh];
    return [knee, [knee[0] + side * Math.sin(a) * LEN.shin, knee[1] + Math.cos(a) * LEN.shin]];
  };
  const [kneeL, ankleL] = leg(hipL, p.legL, -1);
  const [kneeR, ankleR] = leg(hipR, p.legR, 1);
  return { pelvis, shoulderL, shoulderR, neck, headC, elbowL, handL, elbowR, handR, hipL, hipR, kneeL, ankleL, kneeR, ankleR, hip: pelvis, shoulder: [p.cx, chestY], chest: [p.cx, chestY + 12] };
}

function refPt(pts: Pts, r: Ref): V2 {
  if (Array.isArray(r)) return r;
  return pts[r] ?? pts.hip;
}

// ---------- drawing ----------
const W = { torso: 13, neck: 6, upper: 7.5, fore: 6.5, thigh: 10.5, shin: 8.5, foot: 5 };

function seg(a: V2, b: V2, w: number, c: Tone): Shape {
  return { k: 'line', x1: a[0], y1: a[1], x2: b[0], y2: b[1], w, c };
}
/** a limb drawn with a thin background-colored outline so it reads when it crosses the torso */
function segO(out: Shape[], a: V2, b: V2, w: number, c: Tone) {
  out.push(seg(a, b, w + 3, 'bg'));
  out.push(seg(a, b, w, c));
}

function propShapes(props: Prop[] | undefined, pts: Pts): Shape[] {
  const out: Shape[] = [];
  for (const pr of props ?? []) {
    switch (pr.t) {
      case 'rect': out.push({ k: 'rect', x: pr.x, y: pr.y, w: pr.w, h: pr.h, r: pr.r ?? 3, fill: pr.tone ?? 'propSoft' }); break;
      case 'line': out.push(seg(pr.a, pr.b, pr.w ?? 4, pr.tone ?? 'prop')); break;
      case 'circle': out.push(pr.ring ? { k: 'circle', cx: pr.c[0], cy: pr.c[1], r: pr.r, stroke: pr.tone ?? 'prop', sw: 3 } : { k: 'circle', cx: pr.c[0], cy: pr.c[1], r: pr.r, fill: pr.tone ?? 'prop' }); break;
      case 'cable': {
        const b = refPt(pts, pr.to);
        out.push(seg(pr.from, b, 1.6, 'cable'));
        out.push({ k: 'circle', cx: pr.from[0], cy: pr.from[1], r: 4, stroke: 'prop', sw: 2.5 });
        break;
      }
      case 'lever': out.push(seg(pr.from, refPt(pts, pr.to), pr.w ?? 5, 'prop')); out.push({ k: 'circle', cx: pr.from[0], cy: pr.from[1], r: 3.5, fill: 'prop' }); break;
      case 'roller': { const c = refPt(pts, pr.at); out.push({ k: 'circle', cx: c[0], cy: c[1], r: pr.r ?? 6, fill: 'propSoft' }); out.push({ k: 'circle', cx: c[0], cy: c[1], r: (pr.r ?? 6) * 0.35, fill: 'prop' }); break; }
      case 'plate': { const c = refPt(pts, pr.at); const w = pr.w ?? 6, h = pr.h ?? 18; out.push({ k: 'rect', x: c[0] - w / 2, y: c[1] - h / 2, w, h, r: 2, fill: 'plate' }); break; }
      case 'barbell': { const c = refPt(pts, pr.at); const r = pr.r ?? 14; out.push({ k: 'circle', cx: c[0], cy: c[1], r, fill: 'plate' }); out.push({ k: 'circle', cx: c[0], cy: c[1], r: r * 0.55, stroke: 'propSoft', sw: 1.5 }); out.push({ k: 'circle', cx: c[0], cy: c[1], r: 2.6, fill: 'propSoft' }); break; }
      case 'dumbbell': { const c = refPt(pts, pr.at); out.push({ k: 'circle', cx: c[0], cy: c[1], r: 6.5, fill: 'plate' }); out.push({ k: 'circle', cx: c[0], cy: c[1], r: 2, fill: 'propSoft' }); break; }
      case 'grip': { const c = refPt(pts, pr.at); out.push({ k: 'rect', x: c[0] - 5, y: c[1] - 2.5, w: 10, h: 5, r: 2.5, fill: 'prop' }); break; }
      case 'platform': {
        const c = add(refPt(pts, pr.at), pr.off ?? [0, 0]);
        const d = screenDir(pr.angle);
        const a = add(c, scale(d, -pr.len / 2)), b = add(c, scale(d, pr.len / 2));
        out.push(seg(a, b, 5, 'prop'));
        break;
      }
    }
  }
  return out;
}

const has = (hl: Muscle[], ...m: Muscle[]) => m.some((x) => hl.includes(x));

function sideShapes(demo: Demo, p: SidePose): Shape[] {
  const pts = solveSide(p);
  const hl = demo.hl;
  const out: Shape[] = [];
  out.push(...propShapes(demo.back, pts));
  const upperHL = has(hl, 'biceps', 'triceps'), foreHL = has(hl, 'forearms'), thighHL = has(hl, 'quads', 'hamstrings', 'abductors'), shinHL = has(hl, 'calves');
  // far side
  out.push(seg(pts.hipF, pts.kneeF, W.thigh, thighHL ? 'hlFar' : 'bodyFar'));
  out.push(seg(pts.kneeF, pts.ankleF, W.shin, shinHL ? 'hlFar' : 'bodyFar'));
  out.push(seg(pts.ankleF, pts.toeF, W.foot, 'bodyFar'));
  out.push(seg(pts.shoulderF, pts.elbowF, W.upper, upperHL ? 'hlFar' : 'bodyFar'));
  out.push(seg(pts.elbowF, pts.handF, W.fore, foreHL ? 'hlFar' : 'bodyFar'));
  out.push({ k: 'circle', cx: pts.handF[0], cy: pts.handF[1], r: 3.2, fill: 'bodyFar' });
  // torso, neck, head
  out.push(seg(pts.hip, pts.shoulder, W.torso, 'body'));
  out.push(seg(pts.shoulder, pts.neck, W.neck, 'body'));
  out.push({ k: 'circle', cx: pts.headC[0], cy: pts.headC[1], r: LEN.head, fill: 'body' });
  // torso highlights
  const tdir = upDir(p.torso);
  const f0: V2 = [-tdir[1], tdir[0]]; // perpendicular, pointing to the figure's front
  const fwd: V2 = p.flip ? [-f0[0], -f0[1]] : f0;
  const onTorso = (f: number, side: number): V2 => add(lerpV(pts.hip, pts.shoulder, f), scale(fwd, side));
  const blob = (c: V2, rx: number, ry: number) => out.push({ k: 'ellipse', cx: c[0], cy: c[1], rx, ry, rot: p.torso, fill: 'hl' });
  if (has(hl, 'chest')) blob(onTorso(0.74, 3.2), 3.6, 7.5);
  if (has(hl, 'abs')) blob(onTorso(0.32, 3.2), 3.4, 9);
  if (has(hl, 'lats')) blob(onTorso(0.6, -2.6), 3.8, 10);
  if (has(hl, 'midBack')) blob(onTorso(0.72, -3), 3.6, 7);
  if (has(hl, 'lowerBack')) blob(onTorso(0.22, -3.2), 3.2, 7);
  if (has(hl, 'traps')) blob(onTorso(0.97, -2.4), 3.4, 5);
  if (has(hl, 'glutes')) out.push({ k: 'circle', cx: pts.hip[0] - fwd[0] * 4.5, cy: pts.hip[1] - fwd[1] * 4.5, r: 6.5, fill: 'hl' });
  // near side
  segO(out, pts.hip, pts.kneeN, W.thigh, thighHL ? 'hl' : 'body');
  segO(out, pts.kneeN, pts.ankleN, W.shin, shinHL ? 'hl' : 'body');
  out.push(seg(pts.ankleN, pts.toeN, W.foot, 'body'));
  if (has(hl, 'shoulders')) out.push({ k: 'circle', cx: pts.shoulder[0], cy: pts.shoulder[1], r: 6.2, fill: 'hl' });
  if (has(hl, 'rearDelt')) out.push({ k: 'circle', cx: pts.shoulder[0] - fwd[0] * 2.5, cy: pts.shoulder[1] - fwd[1] * 2.5, r: 5.6, fill: 'hl' });
  segO(out, pts.shoulder, pts.elbowN, W.upper, upperHL ? 'hl' : 'body');
  segO(out, pts.elbowN, pts.handN, W.fore, foreHL ? 'hl' : 'body');
  out.push({ k: 'circle', cx: pts.handN[0], cy: pts.handN[1], r: 3.4, fill: 'body' });
  out.push(...propShapes(demo.front, pts));
  return out;
}

function frontShapes(demo: Demo, p: FrontPose): Shape[] {
  const pts = solveFront(p);
  const hl = demo.hl;
  const out: Shape[] = [];
  out.push(...propShapes(demo.back, pts));
  const thighHL = has(hl, 'abductors', 'quads'), upperHL = has(hl, 'biceps', 'triceps');
  // legs
  for (const [h, k, a] of [[pts.hipL, pts.kneeL, pts.ankleL], [pts.hipR, pts.kneeR, pts.ankleR]] as [V2, V2, V2][]) {
    out.push(seg(h, k, W.thigh, thighHL ? 'hl' : 'body'));
    out.push(seg(k, a, W.shin, 'body'));
  }
  // torso as a tapered shape
  const sl = pts.shoulderL, sr = pts.shoulderR;
  out.push({ k: 'poly', pts: [[sl[0] - 2, sl[1] - 2], [sr[0] + 2, sr[1] - 2], [pts.hipR[0] + 3, pts.hipR[1] + 3], [pts.hipL[0] - 3, pts.hipL[1] + 3]], fill: 'body' });
  out.push(seg(pts.neck, [p.cx, pts.shoulder[1] + 2], W.neck, 'body'));
  out.push({ k: 'circle', cx: pts.headC[0], cy: pts.headC[1], r: LEN.head + 0.5, fill: 'body' });
  if (has(hl, 'chest')) { out.push({ k: 'ellipse', cx: p.cx - 6, cy: pts.shoulder[1] + 9, rx: 6, ry: 4.5, rot: 0, fill: 'hl' }); out.push({ k: 'ellipse', cx: p.cx + 6, cy: pts.shoulder[1] + 9, rx: 6, ry: 4.5, rot: 0, fill: 'hl' }); }
  if (has(hl, 'traps')) { out.push({ k: 'poly', pts: [[p.cx - 3, pts.neck[1]], [p.cx + 3, pts.neck[1]], [sr[0], sr[1] - 1], [sl[0], sl[1] - 1]], fill: 'hl' }); }
  if (has(hl, 'lats')) { out.push({ k: 'ellipse', cx: p.cx - 9, cy: pts.shoulder[1] + 18, rx: 3, ry: 9, rot: 8, fill: 'hl' }); out.push({ k: 'ellipse', cx: p.cx + 9, cy: pts.shoulder[1] + 18, rx: 3, ry: 9, rot: -8, fill: 'hl' }); }
  if (has(hl, 'glutes', 'abductors')) { out.push({ k: 'circle', cx: pts.hipL[0] - 3, cy: pts.hipL[1], r: 5.5, fill: 'hl' }); out.push({ k: 'circle', cx: pts.hipR[0] + 3, cy: pts.hipR[1], r: 5.5, fill: 'hl' }); }
  // arms
  for (const [s, e, h] of [[pts.shoulderL, pts.elbowL, pts.handL], [pts.shoulderR, pts.elbowR, pts.handR]] as [V2, V2, V2][]) {
    segO(out, s, e, W.upper, upperHL ? 'hl' : 'body');
    segO(out, e, h, W.fore, 'body');
    out.push({ k: 'circle', cx: h[0], cy: h[1], r: 3.4, fill: 'body' });
    if (has(hl, 'shoulders', 'rearDelt')) out.push({ k: 'circle', cx: s[0], cy: s[1], r: 5.8, fill: 'hl' });
  }
  out.push(...propShapes(demo.front, pts));
  return out;
}

export function shapesAt(demo: Demo, ms: number): Shape[] {
  const p = poseAt(demo, ms);
  const floor: Shape = { k: 'line', x1: -10, y1: 171, x2: 230, y2: 171, w: 2, c: 'floor' };
  return [floor, ...(demo.view === 'side' ? sideShapes(demo, p as SidePose) : frontShapes(demo, p as FrontPose))];
}

export const VIEWBOX = '-10 -28 240 206';
