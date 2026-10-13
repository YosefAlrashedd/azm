import { Pedometer } from 'expo-sensors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Btn, Card, Row, Stepper, Toggle, Txt, useToast } from '../components/ui';
import { WEEKDAYS_SHORT } from '../i18n';
import { notifyNow } from '../logic/notify';
import { isoDay, registerStepsTask, requestSteps, stepsStatus, stepsToday, stepsWeek, type StepsState } from '../logic/steps';
import { useApp } from '../store';
import { fonts, usePalette } from '../theme';

const fmt = (n: number) => n.toLocaleString('en-US');

function Ring({ value, goal, size = 210 }: { value: number; goal: number; size?: number }) {
  const P = usePalette();
  const r = size / 2 - 14, c = 2 * Math.PI * r;
  const pct = Math.min(1, goal ? value / goal : 0);
  const done = value >= goal;
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={P.line} strokeWidth={16} fill="none" />
      {pct > 0 ? <Circle cx={size / 2} cy={size / 2} r={r} stroke={done ? P.good : P.accent} strokeWidth={16} fill="none" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} /> : null}
    </Svg>
  );
}

export default function Steps() {
  const { profile, setProfile, data, setStepsNotified, t, lang } = useApp();
  const P = usePalette();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<StepsState | null>(null);
  const [base, setBase] = useState<number | null>(null); // history count when the live watch started
  const [live, setLive] = useState(0);
  const [week, setWeek] = useState<{ date: string; steps: number }[]>([]);
  const notified = useRef(data.stepsNotified);
  notified.current = data.stepsNotified;

  const refresh = useCallback(async () => {
    const s = await stepsStatus();
    setState(s);
    if (s !== 'ok') return;
    const today = await stepsToday();
    setBase(today ?? 0);
    setLive(0);
    setWeek(await stepsWeek());
    registerStepsTask();
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (st) => st === 'active' && refresh());
    return () => sub.remove();
  }, [refresh]);

  useEffect(() => {
    if (state !== 'ok') return;
    const sub = Pedometer.watchStepCount((r) => setLive(r.steps));
    return () => sub.remove();
  }, [state, base]);

  const total = (base ?? 0) + live;

  // goal reached while the app is open
  useEffect(() => {
    if (state !== 'ok' || !profile.remindSteps) return;
    const today = isoDay(new Date());
    if (total >= profile.stepGoal && notified.current !== today) {
      setStepsNotified(today);
      notifyNow(t('nStepsTitle'), t('nStepsBody', { n: fmt(total) }));
      toast(t('stReached'));
    }
  }, [total, state, profile.stepGoal, profile.remindSteps]); // eslint-disable-line react-hooks/exhaustive-deps

  const max = Math.max(profile.stepGoal, ...week.map((d) => d.steps), 1);
  const avg = week.length ? Math.round(week.reduce((a, d) => a + d.steps, 0) / week.length) : 0;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 10, paddingBottom: 40, gap: 12 }}>
      <Txt v="title">{t('stTitle')}</Txt>

      {state === 'web' ? <Card tone="soft"><Txt v="body">{t('stWeb')}</Txt></Card> : null}
      {state === 'unavailable' ? <Card tone="soft"><Txt v="body">{t('stNA')}</Txt></Card> : null}
      {state === 'undetermined' || state === 'denied' ? (
        <Card tone="soft">
          <Txt v="body">{t('stPerm')}</Txt>
          {state === 'undetermined'
            ? <Btn title={t('stAllow')} onPress={async () => { const s = await requestSteps(); setState(s); if (s === 'ok') refresh(); }} />
            : <Btn kind="secondary" title={t('stSettings')} onPress={() => Linking.openSettings()} />}
        </Card>
      ) : null}

      <Card style={{ alignItems: 'center', gap: 6 }}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Ring value={total} goal={profile.stepGoal} />
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Txt v="big" center style={{ fontSize: 38, color: total >= profile.stepGoal ? P.good : P.accent }}>{state === 'ok' && base != null ? fmt(total) : '—'}</Txt>
            <Txt v="small" center>{t('stToday')}</Txt>
          </View>
        </View>
        <Txt v="body" bold center>{total >= profile.stepGoal ? t('stReached') : t('stLeft', { n: fmt(Math.max(0, profile.stepGoal - total)) })}</Txt>
        <Txt v="small" center>{t('stGoal', { n: fmt(profile.stepGoal) })}</Txt>
        {Platform.OS === 'android' ? <Txt v="small" center>{t('stAndroid')}</Txt> : null}
      </Card>

      {week.length ? (
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="h2">{t('stWeek')}</Txt>
            <Txt v="small">{t('stAvg', { n: fmt(avg) })}</Txt>
          </Row>
          <Row gap={6} center={false} style={{ height: 130, alignItems: 'flex-end' }}>
            {week.map((d, i) => {
              const isToday = i === week.length - 1;
              const v = isToday ? Math.max(d.steps, total) : d.steps;
              const h = Math.max(4, (v / max) * 100);
              const wd = new Date(d.date + 'T12:00:00').getDay();
              return (
                <View key={d.date} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                  <Txt v="small" center style={{ fontSize: 10 }}>{v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}</Txt>
                  <View style={{ width: '70%', height: h, borderRadius: 6, backgroundColor: v >= profile.stepGoal ? P.good : isToday ? P.accent : P.soft }} />
                  <Txt v="small" center style={{ fontSize: 10, fontFamily: isToday ? fonts.bold : fonts.regular }}>{WEEKDAYS_SHORT[lang][wd]}</Txt>
                </View>
              );
            })}
          </Row>
        </Card>
      ) : null}

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="body" bold>{t('stGoalLabel')}</Txt>
          <Stepper value={profile.stepGoal} step={500} min={2000} max={30000} format={fmt} onChange={(n) => setProfile({ stepGoal: n })} />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="body" style={{ flex: 1 }}>{t('stNotify')}</Txt>
          <Toggle value={profile.remindSteps} onChange={(v) => setProfile({ remindSteps: v })} />
        </Row>
      </Card>
    </ScrollView>
  );
}
