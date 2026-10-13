import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundTask from 'expo-background-task';
import { Pedometer } from 'expo-sensors';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { tr } from '../i18n';
import type { AppData } from '../types';
import { notifyNow } from './notify';

export const STEPS_TASK = 'azm-steps-check';
const STORAGE_KEY = 'azm:data:v1';

export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const isoDay = (d: Date) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};

export type StepsState = 'web' | 'unavailable' | 'denied' | 'undetermined' | 'ok';

export async function stepsStatus(): Promise<StepsState> {
  if (Platform.OS === 'web') return 'web';
  try {
    if (!(await Pedometer.isAvailableAsync())) return 'unavailable';
    const p = await Pedometer.getPermissionsAsync();
    if (p.granted) return 'ok';
    return p.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'unavailable';
  }
}

export async function requestSteps(): Promise<StepsState> {
  try {
    const p = await Pedometer.requestPermissionsAsync();
    return p.granted ? 'ok' : 'denied';
  } catch {
    return 'denied';
  }
}

/** Steps since midnight. iOS only (Android has no history query); returns null when unknown. */
export async function stepsToday(): Promise<number | null> {
  if (Platform.OS !== 'ios') return null;
  try {
    const r = await Pedometer.getStepCountAsync(startOfDay(), new Date());
    return r.steps;
  } catch {
    return null;
  }
}

/** The last 7 days, oldest first (iOS keeps 7 days of history). */
export async function stepsWeek(): Promise<{ date: string; steps: number }[]> {
  if (Platform.OS !== 'ios') return [];
  const out: { date: string; steps: number }[] = [];
  const today = startOfDay();
  for (let i = 6; i >= 0; i--) {
    const a = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const b = i === 0 ? new Date() : new Date(today.getFullYear(), today.getMonth(), today.getDate() - i + 1);
    try {
      const r = await Pedometer.getStepCountAsync(a, b);
      out.push({ date: isoDay(a), steps: r.steps });
    } catch {
      out.push({ date: isoDay(a), steps: 0 });
    }
  }
  return out;
}

/**
 * Background check: when today's steps pass the goal, send one notification per day.
 * Defined at module load (required by TaskManager); iOS decides when it actually runs.
 */
if (Platform.OS !== 'web') {
  try {
    TaskManager.defineTask(STEPS_TASK, async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return BackgroundTask.BackgroundTaskResult.Success;
        const data = JSON.parse(raw) as AppData;
        const p = data.profile;
        const today = isoDay(new Date());
        if (!p || !p.remindSteps || data.stepsNotified === today) return BackgroundTask.BackgroundTaskResult.Success;
        const steps = await stepsToday();
        if (steps != null && steps >= p.stepGoal) {
          await notifyNow(tr(p.lang, 'nStepsTitle'), tr(p.lang, 'nStepsBody', { n: steps.toLocaleString('en-US') }));
          data.stepsNotified = today;
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return BackgroundTask.BackgroundTaskResult.Success;
      } catch {
        return BackgroundTask.BackgroundTaskResult.Failed;
      }
    });
  } catch {}
}

export async function registerStepsTask() {
  if (Platform.OS === 'web') return;
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;
    if (await TaskManager.isTaskRegisteredAsync(STEPS_TASK)) return;
    await BackgroundTask.registerTaskAsync(STEPS_TASK, { minimumInterval: 30 });
  } catch {}
}
