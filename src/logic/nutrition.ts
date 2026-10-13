import type { Goal, Profile, Weight } from '../types';

const ACTIVITY: Record<number, number> = { 3: 1.45, 4: 1.55, 5: 1.65 };
const GOAL_KCAL: Record<Goal, number> = { bulk: 300, cut: -450, maintain: 0 };
const PROTEIN_PER_KG: Record<Goal, number> = { bulk: 2.0, cut: 2.2, maintain: 1.8 };
const round = (n: number, step: number) => Math.round(n / step) * step;

export function currentWeight(profile: Profile, weights: Weight[]): number {
  return weights.length ? weights[weights.length - 1].kg : profile.startKg;
}

/** Mifflin-St Jeor resting energy */
export function bmr(p: Profile, kg: number): number {
  return 10 * kg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'm' ? 5 : -161);
}

export type Targets = { tdee: number; kcal: number; protein: number; fat: number; carbs: number };

export function targets(p: Profile, kg: number): Targets {
  const tdee = bmr(p, kg) * (ACTIVITY[p.days] ?? 1.55);
  const kcal = round(tdee + GOAL_KCAL[p.goal] + p.calAdjust, 50);
  const protein = round(PROTEIN_PER_KG[p.goal] * kg, 5);
  const fat = round(Math.max(0.8 * kg, (kcal * 0.22) / 9), 5);
  const carbs = Math.max(0, round((kcal - protein * 4 - fat * 9) / 4, 5));
  return { tdee: round(tdee, 50), kcal, protein, fat, carbs };
}

/** Healthy weekly change in kg for the goal: [low, high]. Negative for a cut. */
export function weeklyRange(p: Profile, kg: number): [number, number] {
  if (p.goal === 'bulk') return [0.0025 * kg, 0.0075 * kg];
  if (p.goal === 'cut') return [-0.01 * kg, -0.004 * kg];
  return [-0.003 * kg, 0.003 * kg];
}

export function targetRate(p: Profile, kg: number): number {
  const [lo, hi] = weeklyRange(p, kg);
  return (lo + hi) / 2;
}

export type TrendStatus =
  | { kind: 'reached' }
  | { kind: 'missed'; days: number }
  | { kind: 'slow'; rate: number; kcal: number }
  | { kind: 'fast'; rate: number; kcal: number }
  | { kind: 'ok'; rate: number }
  | { kind: 'early' };

const daysBetween = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) / 864e5;

export function todayISO(d = new Date()): string {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
}

/**
 * Compares the last weigh-in against one at least 10 days earlier.
 * "slow" means the trend is too flat for the goal (a stall on a bulk, too little loss on a cut).
 */
export function trend(p: Profile, weights: Weight[], today = todayISO()): TrendStatus {
  if (!weights.length) return { kind: 'early' };
  const last = weights[weights.length - 1];
  const reached = p.goal === 'bulk' ? last.kg >= p.goalKg : p.goal === 'cut' ? last.kg <= p.goalKg : false;
  if (reached) return { kind: 'reached' };
  const since = daysBetween(last.date, today);
  if (since > 8) return { kind: 'missed', days: Math.floor(since) };
  const ref = [...weights].reverse().find((w) => daysBetween(w.date, last.date) >= 10);
  if (!ref) return { kind: 'early' };
  const rate = (last.kg - ref.kg) / (daysBetween(ref.date, last.date) / 7);
  const [lo, hi] = weeklyRange(p, last.kg);
  if (p.goal === 'maintain') {
    if (rate > hi) return { kind: 'fast', rate, kcal: -150 };
    if (rate < lo) return { kind: 'slow', rate, kcal: 150 };
    return { kind: 'ok', rate };
  }
  if (p.goal === 'bulk') {
    if (rate < lo) return { kind: 'slow', rate, kcal: 200 };
    if (rate > hi) return { kind: 'fast', rate, kcal: -150 };
    return { kind: 'ok', rate };
  }
  // cut: lo is the fastest safe loss (most negative), hi the slowest useful loss
  if (rate > hi) return { kind: 'slow', rate, kcal: -150 };
  if (rate < lo) return { kind: 'fast', rate, kcal: 150 };
  return { kind: 'ok', rate };
}

/** Rate over the whole log, used for the goal date estimate */
export function overallRate(weights: Weight[]): number | null {
  if (weights.length < 2) return null;
  const a = weights[0], b = weights[weights.length - 1];
  const wk = daysBetween(a.date, b.date) / 7;
  return wk >= 1 ? (b.kg - a.kg) / wk : null;
}

export function etaDate(p: Profile, weights: Weight[]): Date | null {
  const kg = currentWeight(p, weights);
  const left = p.goalKg - kg;
  if (p.goal === 'maintain' || Math.abs(left) < 0.05) return null;
  let r = overallRate(weights);
  const tr = targetRate(p, kg);
  if (r == null || Math.sign(r) !== Math.sign(left) || Math.abs(r) < 0.05) r = tr;
  return new Date(Date.now() + (left / r) * 7 * 864e5);
}
