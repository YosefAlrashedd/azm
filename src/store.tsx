import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { tr, type StrKey } from './i18n';
import { defaultLiftDays, templateFor } from './logic/program';
import type { AppData, Lang, Profile, ProgramDay, Session, Weight, WorkoutDraft } from './types';

export const STORAGE_KEY = 'azm:data:v1';

export const blankWS = (): WorkoutDraft => ({ day: null, startedAt: null, active: null, actStart: null, durs: {}, done: {}, draft: {} });

/** Defaults used to prefill the first-run setup. Nothing personal: the user enters their own details. */
export const DEFAULT_PROFILE: Profile = {
  lang: 'ar', sex: 'm', age: 25, heightCm: 175, startKg: 70, goalKg: 75, goal: 'bulk',
  days: 4, liftDays: [1, 2, 4, 5], stepGoal: 8000, calAdjust: 0, recovery: true,
  remindAt: 17 * 60, remindWorkout: true, remindWeighIn: true, remindSteps: true,
};

function deviceLang(): Lang {
  try {
    return getLocales()[0]?.languageCode === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

/** A fresh install starts with no profile, so the setup screen shows. */
export function seedData(): AppData {
  return { version: 1, profile: null, program: null, custom: {}, sessions: [], weights: [], ws: blankWS(), stepsNotified: null };
}

const bySession = (a: Session, b: Session) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const byDate = (a: Weight, b: Weight) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);

type Ctx = {
  ready: boolean;
  /** true until the user finishes the first-run setup */
  needsSetup: boolean;
  data: AppData;
  profile: Profile;
  program: ProgramDay[];
  lang: Lang;
  t: (k: StrKey, v?: Record<string, string | number>) => string;
  rtl: boolean;
  setProfile: (p: Partial<Profile>) => void;
  setLang: (l: Lang) => void;
  completeSetup: (p: Profile, today: string) => void;
  setProgram: (p: ProgramDay[] | null) => void;
  addCustom: (id: string, name: string) => void;
  saveSession: (s: Session) => void;
  deleteSession: (id: string) => void;
  putWeight: (w: Weight) => void;
  deleteWeight: (date: string) => void;
  setWS: (fn: (ws: WorkoutDraft) => WorkoutDraft) => void;
  setStepsNotified: (d: string) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(seedData);
  const [ready, setReady] = useState(false);
  const [draftLang, setDraftLang] = useState<Lang>(deviceLang);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(data);
  latest.current = data;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as AppData;
          setData({ ...seedData(), ...parsed, ws: { ...blankWS(), ...(parsed.ws || {}) } });
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedData()));
        }
      } catch (e) {
        console.warn('load failed', e);
      }
      setReady(true);
    })();
  }, []);

  const persist = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(latest.current)).catch((e) => console.warn('save failed', e));
    }, 250);
  }, []);

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((d) => {
      const n = fn(d);
      latest.current = n;
      return n;
    });
    persist();
  }, [persist]);

  const profile = useMemo(() => data.profile ?? { ...DEFAULT_PROFILE, lang: draftLang }, [data.profile, draftLang]);
  const program = useMemo(() => data.program ?? templateFor(profile.days), [data.program, profile.days]);
  const lang = profile.lang;

  const value = useMemo<Ctx>(() => ({
    ready, data, profile, program, lang,
    needsSetup: ready && !data.profile,
    rtl: lang === 'ar',
    t: (k, v) => tr(lang, k, v),
    setLang: (l) => {
      if (data.profile) update((d) => ({ ...d, profile: { ...(d.profile ?? DEFAULT_PROFILE), lang: l } }));
      else setDraftLang(l);
    },
    completeSetup: (p, today) => update((d) => ({
      ...d,
      profile: p,
      program: null,
      weights: d.weights.filter((x) => x.date !== today).concat([{ date: today, kg: p.startKg }]).sort(byDate),
    })),
    setProfile: (p) => update((d) => {
      const cur = d.profile ?? { ...DEFAULT_PROFILE, lang: draftLang };
      const next = { ...cur, ...p };
      let prog = d.program;
      if (p.days && p.days !== cur.days) {
        prog = null; // switch to the template for the new day count
        if (!p.liftDays) next.liftDays = defaultLiftDays(p.days);
      }
      return { ...d, profile: next, program: prog };
    }),
    setProgram: (prog) => update((d) => ({ ...d, program: prog })),
    addCustom: (id, name) => update((d) => ({ ...d, custom: { ...d.custom, [id]: name } })),
    saveSession: (s) => update((d) => ({ ...d, sessions: d.sessions.filter((x) => x.id !== s.id).concat([s]).sort(bySession) })),
    deleteSession: (id) => update((d) => ({ ...d, sessions: d.sessions.filter((x) => x.id !== id) })),
    putWeight: (w) => update((d) => ({ ...d, weights: d.weights.filter((x) => x.date !== w.date).concat([w]).sort(byDate) })),
    deleteWeight: (date) => update((d) => ({ ...d, weights: d.weights.filter((x) => x.date !== date) })),
    setWS: (fn) => update((d) => ({ ...d, ws: fn(d.ws) })),
    setStepsNotified: (date) => update((d) => ({ ...d, stepsNotified: date })),
  }), [ready, data, profile, program, lang, update, draftLang]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp outside provider');
  return c;
}

export function lastFor(sessions: Session[], ex: string): { date: string; id: string; sets: { w: number; r: number }[] } | null {
  let best: { date: string; id: string; sets: { w: number; r: number }[] } | null = null;
  for (const s of sessions) {
    const e = s.entries.find((x) => x.ex === ex);
    if (!e || !e.sets.length) continue;
    if (!best || s.date > best.date || (s.date === best.date && s.id > best.id)) best = { date: s.date, id: s.id, sets: e.sets };
  }
  return best;
}
