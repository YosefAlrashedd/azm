export type Lang = 'ar' | 'en';
export type Goal = 'bulk' | 'cut' | 'maintain';
export type DaysPerWeek = 3 | 4 | 5;

export type Profile = {
  lang: Lang;
  sex: 'm' | 'f';
  age: number;
  heightCm: number;
  startKg: number;
  goalKg: number;
  goal: Goal;
  days: DaysPerWeek;
  /** weekday numbers, 0 = Sunday */
  liftDays: number[];
  stepGoal: number;
  /** kcal adjustment applied from weight-trend alerts */
  calAdjust: number;
  /** show sauna / cold / jacuzzi suggestions */
  recovery: boolean;
  /** daily workout reminder, minutes after midnight */
  remindAt: number;
  remindWorkout: boolean;
  remindWeighIn: boolean;
  remindSteps: boolean;
};

export type SetT = { w: number; r: number };
export type Entry = { ex: string; sets: SetT[]; sec?: number };
export type Session = { id: string; date: string; day: string; entries: Entry[]; dur?: number };
export type Weight = { date: string; kg: number };

export type ProgramItem = { ex: string; sets: number; reps: string; rest: number };
export type ProgramDay = { key: string; items: ProgramItem[] };

export type WorkoutDraft = {
  day: string | null;
  startedAt: number | null;
  active: string | null;
  actStart: number | null;
  durs: Record<string, number>;
  done: Record<string, boolean>;
  draft: Record<string, { w: string; r: string }[]>;
};

export type AppData = {
  version: 1;
  profile: Profile | null;
  /** user-edited program; null = use the template for profile.days */
  program: ProgramDay[] | null;
  /** names for user-added exercises, keyed by id ("c:...") */
  custom: Record<string, string>;
  sessions: Session[];
  weights: Weight[];
  ws: WorkoutDraft;
  stepsNotified: string | null;
};
