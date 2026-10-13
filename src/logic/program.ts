import type { DaysPerWeek, ProgramDay, ProgramItem, Profile } from '../types';

const C = (ex: string, sets = 3, reps = '6–10', rest = 150): ProgramItem => ({ ex, sets, reps, rest });
const I = (ex: string, sets = 3, reps = '10–15', rest = 90): ProgramItem => ({ ex, sets, reps, rest });

const PUSH: ProgramDay = { key: 'push', items: [C('benchBB'), C('shoulderPressM', 3, '8–12', 120), I('inclineFlyDB', 3, '10–12'), I('lateralCable', 3, '12–15'), I('tricepsExtCable'), I('kickbackCable'), C('legPress', 3, '10–12', 150), I('hangingLegRaise', 3, '10–20')] };
const PULL: ProgramDay = { key: 'pull', items: [C('pulldownClose', 3, '8–12', 120), C('seatedRowM', 3, '8–12', 120), I('rearDeltCable', 3, '12–15'), I('shrugM', 3, '8–12'), I('hammerCable', 3, '10–12'), I('preacherM', 3, '8–12'), I('seatedLegCurl', 3, '8–12')] };
const UPPER: ProgramDay = { key: 'upper', items: [C('inclineBB'), I('pecDeck', 3, '10–12'), C('widePullup', 3, '6–12', 150), I('lateralCable', 3, '12–15'), C('pendlayRow', 3, '6–10', 150), C('ohpCable', 3, '8–12', 120), I('curlCable', 3, '10–12')] };
const LOWER: ProgramDay = { key: 'lower', items: [I('lyingLegCurl', 3, '8–12'), C('bssDB', 3, '6–10', 150), I('backExt', 3, '10–15'), I('legExt', 3, '10–15'), I('calfPress', 3, '10–15'), I('cableCrunch', 3, '10–15'), I('hipAbd', 3, '12–20')] };
const LEGS: ProgramDay = { key: 'legs', items: [C('legPress', 3, '8–12', 150), C('bssDB', 3, '8–10', 150), I('legExt', 3, '12–15'), I('seatedLegCurl', 3, '10–12'), I('hipAbd', 3, '12–20'), I('calfPress', 3, '10–15'), I('hangingLegRaise', 3, '10–20')] };
const FULL_A: ProgramDay = { key: 'fullA', items: [C('benchBB'), C('pulldownClose', 3, '8–12', 120), C('legPress', 3, '10–12', 150), I('lateralCable', 3, '12–15'), I('hammerCable', 3, '10–12'), I('cableCrunch', 3, '10–15')] };
const FULL_B: ProgramDay = { key: 'fullB', items: [C('inclineBB'), C('seatedRowM', 3, '8–12', 120), C('bssDB', 3, '8–10', 150), C('shoulderPressM', 3, '8–12', 120), I('tricepsExtCable'), I('lyingLegCurl', 3, '10–12')] };
const FULL_C: ProgramDay = { key: 'fullC', items: [I('pecDeck', 3, '10–12'), C('widePullup', 3, '6–12', 150), I('legExt', 3, '12–15'), I('seatedLegCurl', 3, '10–12'), I('rearDeltCable', 3, '12–15'), I('curlCable', 3, '10–12'), I('calfPress', 3, '10–15')] };

const clone = (d: ProgramDay): ProgramDay => ({ key: d.key, items: d.items.map((i) => ({ ...i })) });

export function templateFor(days: DaysPerWeek): ProgramDay[] {
  if (days === 3) return [FULL_A, FULL_B, FULL_C].map(clone);
  if (days === 5) return [PUSH, PULL, LEGS, UPPER, LOWER].map(clone);
  return [PUSH, PULL, UPPER, LOWER].map(clone);
}

/** Default training weekdays (0 = Sunday). 4 days matches Mon Push, Tue Pull, Thu Upper, Fri Lower. */
export function defaultLiftDays(days: DaysPerWeek): number[] {
  if (days === 3) return [0, 2, 4];
  if (days === 5) return [0, 1, 2, 4, 5];
  return [1, 2, 4, 5];
}

export const LEG_DAYS = new Set(['lower', 'legs']);

/** Which program day falls on a weekday, or null for a rest day. */
export function dayForWeekday(profile: Profile, program: ProgramDay[], weekday: number): ProgramDay | null {
  const sorted = [...profile.liftDays].sort((a, b) => a - b);
  const idx = sorted.indexOf(weekday);
  if (idx < 0 || !program.length) return null;
  return program[idx % program.length];
}

/** The program day for today if it is a training day, otherwise the next one. */
export function upcomingDay(profile: Profile, program: ProgramDay[], from = new Date(), offset = 0): ProgramDay {
  const d = from.getDay();
  for (let k = offset; k < offset + 7; k++) {
    const p = dayForWeekday(profile, program, (d + k) % 7);
    if (p) return p;
  }
  return program[0];
}

export type PlanItem = { kind: 'walk' | 'zone2' | 'sauna' | 'cold' | 'hot' | 'weigh' | 'stroll'; min: number };
export type WeekDayPlan = { weekday: number; lift: ProgramDay | null; items: PlanItem[] };

/**
 * Cardio and recovery for each weekday.
 * Rest days: the first two get Zone 2 (plus sauna → cold when recovery is on), the rest a light walk.
 * Training days: incline walk after upper-body days, hot jacuzzi after leg days, sauna on every other upper day.
 * Cold exposure only lands on rest days, so it never follows a lifting session.
 */
export function weekPlan(profile: Profile, program: ProgramDay[]): WeekDayPlan[] {
  const out: WeekDayPlan[] = [];
  const rest = [0, 1, 2, 3, 4, 5, 6].filter((d) => !profile.liftDays.includes(d));
  const zone2Days = new Set(rest.slice(0, 2));
  let upperCount = 0;
  for (let wd = 0; wd < 7; wd++) {
    const lift = dayForWeekday(profile, program, wd);
    const items: PlanItem[] = [];
    if (wd === 5) items.push({ kind: 'weigh', min: 0 });
    if (lift) {
      if (LEG_DAYS.has(lift.key)) {
        if (profile.recovery) items.push({ kind: 'hot', min: 15 });
      } else {
        items.push({ kind: 'walk', min: 15 });
        if (profile.recovery && upperCount % 2 === 0) items.push({ kind: 'sauna', min: 20 });
        upperCount++;
      }
    } else if (zone2Days.has(wd)) {
      items.push({ kind: 'zone2', min: 30 });
      if (profile.recovery) items.push({ kind: 'sauna', min: 15 }, { kind: 'cold', min: 3 });
    } else {
      items.push({ kind: 'stroll', min: 40 });
    }
    out.push({ weekday: wd, lift, items });
  }
  return out;
}
