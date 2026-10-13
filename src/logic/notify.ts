import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MOTIVATION, tr } from '../i18n';
import type { Profile, ProgramDay } from '../types';
import { dayForWeekday } from './program';

const TAG = 'azm';
export const notificationsSupported = Platform.OS !== 'web';

export function configureNotifications() {
  if (!notificationsSupported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('reminders', { name: 'Reminders', importance: Notifications.AndroidImportance.HIGH }).catch(() => {});
  }
}

export async function ensurePermission(ask = true): Promise<boolean> {
  if (!notificationsSupported) return false;
  try {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted || cur.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return true;
    if (!ask || !cur.canAskAgain) return false;
    const r = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: true } });
    return r.granted || r.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
}

async function cancelOurs() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(all.filter((n) => (n.content.data as Record<string, unknown> | undefined)?.tag === TAG).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

const dayLabel = (lang: Profile['lang'], key: string) => tr(lang, ('day_' + key) as never);

function lineFor(profile: Profile, dayKey: string, n: number): string {
  const lines = MOTIVATION[profile.lang];
  const raw = lines[n % lines.length];
  return raw.split('{goal}').join(String(profile.goalKg)).split('{day}').join(dayLabel(profile.lang, dayKey));
}

/**
 * Rebuilds every reminder: Friday 10:00 weigh-in (weekly), and one training-day reminder per
 * upcoming training day for the next 3 weeks, each with a different line so they don't repeat.
 */
export async function rescheduleAll(profile: Profile, program: ProgramDay[]): Promise<void> {
  if (!notificationsSupported) return;
  try {
    await cancelOurs();
    const anyOn = profile.remindWeighIn || profile.remindWorkout;
    if (!anyOn) return;
    if (!(await ensurePermission(false))) return;
    const channel = Platform.OS === 'android' ? { channelId: 'reminders' } : {};
    if (profile.remindWeighIn) {
      await Notifications.scheduleNotificationAsync({
        content: { title: tr(profile.lang, 'nWeighTitle'), body: tr(profile.lang, 'nWeighBody'), data: { tag: TAG, kind: 'weigh' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 6, hour: 10, minute: 0, ...channel },
      });
    }
    if (profile.remindWorkout) {
      const now = new Date();
      const seed = Math.floor(now.getTime() / 864e5);
      let count = 0;
      for (let i = 0; i < 21 && count < 14; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, Math.floor(profile.remindAt / 60), profile.remindAt % 60, 0);
        if (d.getTime() <= now.getTime() + 60_000) continue;
        const day = dayForWeekday(profile, program, d.getDay());
        if (!day) continue;
        await Notifications.scheduleNotificationAsync({
          content: { title: tr(profile.lang, 'nWorkoutTitle', { day: dayLabel(profile.lang, day.key) }), body: lineFor(profile, day.key, seed + i), data: { tag: TAG, kind: 'workout' } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: d, ...channel },
        });
        count++;
      }
    }
  } catch (e) {
    console.warn('reschedule failed', e);
  }
}

export async function sendTest(profile: Profile, dayKey: string): Promise<boolean> {
  if (!(await ensurePermission(true))) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: tr(profile.lang, 'nWorkoutTitle', { day: dayLabel(profile.lang, dayKey) }), body: lineFor(profile, dayKey, Math.floor(Math.random() * 100)), data: { tag: 'azm-test' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
  });
  return true;
}

export async function notifyNow(title: string, body: string) {
  if (!notificationsSupported) return;
  try {
    await Notifications.scheduleNotificationAsync({ content: { title, body, data: { tag: 'azm-now' } }, trigger: null });
  } catch {}
}
