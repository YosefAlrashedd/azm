import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Card, Chip, Divider, Field, Row, Stepper, Toggle, Txt, useDir, useToast } from '../components/ui';
import { GUIDES, WEEKDAYS, WEEKDAYS_SHORT } from '../i18n';
import { sendTest } from '../logic/notify';
import { currentWeight, targetRate, targets } from '../logic/nutrition';
import { upcomingDay, weekPlan, type PlanItem } from '../logic/program';
import { useApp } from '../store';
import { radius, usePalette } from '../theme';
import type { DaysPerWeek, Goal } from '../types';

const ITEM_TONE: Record<PlanItem['kind'], 'soft' | 'plate' | 'ice' | 'bad' | 'good'> = {
  walk: 'soft', zone2: 'soft', stroll: 'soft', sauna: 'plate', cold: 'ice', hot: 'bad', weigh: 'good',
};

function Tag({ item }: { item: PlanItem }) {
  const { t } = useApp();
  const P = usePalette();
  const tone = ITEM_TONE[item.kind];
  const bg = { soft: P.soft, plate: P.plateSoft, ice: P.iceSoft, bad: P.badSoft, good: P.goodSoft }[tone];
  const fg = { soft: P.accent, plate: P.plate, ice: P.ice, bad: P.bad, good: P.good }[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
      <Txt v="small" bold style={{ color: fg }}>{t(('it_' + item.kind) as never)}{item.min ? ` ${item.min} ${t('min')}` : ''}</Txt>
    </View>
  );
}

const parseNum = (v: string) => {
  const s = v.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632)).replace(/[٫,،]/g, '.').trim();
  return s === '' ? NaN : Number(s);
};

function NumField({ value, onCommit }: { value: number; onCommit: (n: number) => boolean }) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  const commit = () => {
    const n = parseNum(v);
    if (isNaN(n) || !onCommit(n)) setV(String(value));
  };
  return <Field style={{ width: 96 }} value={v} onChangeText={setV} keyboardType="decimal-pad" onBlur={commit} onSubmitEditing={commit} returnKeyType="done" />;
}

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export default function Plan() {
  const { profile, setProfile, program, setProgram, data, t, lang } = useApp();
  const P = usePalette();
  const dir = useDir();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const kg = currentWeight(profile, data.weights);
  const tg = targets(profile, kg);
  const plan = weekPlan(profile, program);
  const today = new Date().getDay();
  const [open, setOpen] = useState<number | null>(null);
  const [restoreArm, setRestoreArm] = useState(0);
  const order = [0, 1, 2, 3, 4, 5, 6];

  const toggleDay = (wd: number) => {
    const has = profile.liftDays.includes(wd);
    let next = has ? profile.liftDays.filter((d) => d !== wd) : [...profile.liftDays, wd];
    if (next.length > profile.days) next = next.slice(next.length - profile.days);
    setProfile({ liftDays: next.sort((a, b) => a - b) });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 10, paddingBottom: 40, gap: 14 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
      <Txt v="title">{t('plTitle')}</Txt>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Txt v="big" ltr style={{ textAlign: dir.align }}>{tg.kcal.toLocaleString('en-US')}</Txt>
            <Txt v="small">{t('plKcal')}{profile.calAdjust ? ' · ' + t('plAdjusted', { n: (profile.calAdjust > 0 ? '+' : '') + profile.calAdjust }) : ''}</Txt>
          </View>
          <View style={{ alignItems: dir.end }}>
            <Txt v="small">{t('goal_' + profile.goal as never)}</Txt>
            <Txt v="h2" color="accent" ltr>{profile.goalKg} {t('kg')}</Txt>
          </View>
        </Row>
        <Row gap={8}>
          {[[tg.protein, t('plProtein'), P.accent], [tg.carbs, t('plCarbs'), P.plate], [tg.fat, t('plFat'), P.good]].map(([v, l, c]) => (
            <View key={l as string} style={{ flex: 1, borderWidth: 1, borderColor: P.line, borderRadius: radius.md, padding: 10, alignItems: 'center' }}>
              <Txt v="h2" center style={{ color: c as string }} ltr>{v}g</Txt>
              <Txt v="small" center>{l}</Txt>
            </View>
          ))}
        </Row>
        <Txt v="small">{t('plGoalLine', { start: data.weights[0]?.kg ?? profile.startKg, goal: profile.goalKg, rate: (targetRate(profile, kg) >= 0 ? '+' : '') + targetRate(profile, kg).toFixed(2) })}</Txt>
      </Card>

      <View style={{ gap: 8 }}>
        <Txt v="h2">{t('plWeek')}</Txt>
        {order.map((wd) => {
          const d = plan[wd];
          const isToday = wd === today;
          return (
            <Row key={wd} gap={12} center={false} style={{ backgroundColor: P.surface, borderRadius: radius.md, borderWidth: isToday ? 2 : 1, borderColor: isToday ? P.accent : P.line, padding: 10 }}>
              <View style={{ width: 74, gap: 1 }}>
                <Txt v="body" bold>{WEEKDAYS[lang][wd]}</Txt>
                <Txt v="small">{d.lift ? t(('day_' + d.lift.key) as never) : t('plRest')}{isToday ? ' · ' + t('plToday') : ''}</Txt>
              </View>
              <View style={{ flex: 1, flexDirection: dir.row, flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
                {d.items.map((it, i) => <Tag key={i} item={it} />)}
              </View>
            </Row>
          );
        })}
        {profile.recovery ? <Txt v="small">❄︎ {t('plColdRule')}</Txt> : null}
      </View>

      <View style={{ gap: 8 }}>
        <Txt v="h2">{t('plGuides')}</Txt>
        <Card style={{ gap: 0, paddingVertical: 4 }}>
          {GUIDES[lang].map((g, i) => (
            <View key={i}>
              {i ? <Divider /> : null}
              <Pressable onPress={() => setOpen(open === i ? null : i)} style={{ paddingVertical: 12 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Txt v="body" bold>{g.title}</Txt>
                  <Txt v="muted">{open === i ? '▴' : '▾'}</Txt>
                </Row>
              </Pressable>
              {open === i ? <View style={{ gap: 6, paddingBottom: 12 }}>{g.body.map((b, j) => <Txt key={j} v="muted">• {b}</Txt>)}</View> : null}
            </View>
          ))}
        </Card>
      </View>

      <View style={{ gap: 8 }}>
        <Txt v="h2">{t('plSettings')}</Txt>
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="body" bold>{t('setLang')}</Txt>
            <Row gap={6}>
              <Chip label="العربية" on={lang === 'ar'} onPress={() => setProfile({ lang: 'ar' })} />
              <Chip label="English" on={lang === 'en'} onPress={() => setProfile({ lang: 'en' })} />
            </Row>
          </Row>
          <Divider />
          <Txt v="body" bold>{t('setDays')}</Txt>
          <Row gap={6}>
            {([3, 4, 5] as DaysPerWeek[]).map((n) => (
              <Chip key={n} flex label={String(n)} on={profile.days === n} onPress={() => { if (n !== profile.days) { setProfile({ days: n }); toast(t('setDaysChanged', { n })); } }} />
            ))}
          </Row>
          <Txt v="small">{t('setPickDays', { n: profile.days })}{profile.liftDays.length !== profile.days ? ` (${profile.liftDays.length}/${profile.days})` : ''}</Txt>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>
            {order.map((wd) => <Chip key={wd} label={WEEKDAYS_SHORT[lang][wd]} on={profile.liftDays.includes(wd)} onPress={() => toggleDay(wd)} style={{ width: '23%', paddingHorizontal: 2 }} />)}
          </Row>
          <Divider />
          <Txt v="body" bold>{t('setGoal')}</Txt>
          <Row gap={6}>
            {(['bulk', 'maintain', 'cut'] as Goal[]).map((g) => <Chip key={g} flex label={t(('goal_' + g) as never)} on={profile.goal === g} onPress={() => setProfile({ goal: g, calAdjust: 0 })} />)}
          </Row>
        </Card>

        <Card>
          <Txt v="body" bold>{t('setProfile')}</Txt>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="body">{t('setSex')}</Txt>
            <Row gap={6}>
              <Chip label={t('sex_m')} on={profile.sex === 'm'} onPress={() => setProfile({ sex: 'm' })} />
              <Chip label={t('sex_f')} on={profile.sex === 'f'} onPress={() => setProfile({ sex: 'f' })} />
            </Row>
          </Row>
          {([
            ['setAge', profile.age, (n: number) => n >= 13 && n <= 90 && (setProfile({ age: Math.round(n) }), true)],
            ['setHeight', profile.heightCm, (n: number) => n >= 120 && n <= 230 && (setProfile({ heightCm: n }), true)],
            ['setStart', profile.startKg, (n: number) => n >= 30 && n <= 250 && (setProfile({ startKg: n }), true)],
            ['setGoalKg', profile.goalKg, (n: number) => n >= 30 && n <= 250 && (setProfile({ goalKg: n }), true)],
          ] as [string, number, (n: number) => boolean][]).map(([k, v, f]) => (
            <Row key={k} style={{ justifyContent: 'space-between' }}>
              <Txt v="body" style={{ flex: 1 }}>{t(k as never)}</Txt>
              <NumField value={v} onCommit={f} />
            </Row>
          ))}
        </Card>

        <Card>
          <Txt v="body" bold>{t('setReminders')}</Txt>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="body" style={{ flex: 1 }}>{t('setRemindWorkout')}</Txt>
            <Toggle value={profile.remindWorkout} onChange={(v) => setProfile({ remindWorkout: v })} />
          </Row>
          {profile.remindWorkout ? (
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt v="muted">{t('setRemindTime')}</Txt>
              <Stepper value={profile.remindAt} step={30} min={5 * 60} max={23 * 60} format={hhmm} onChange={(n) => setProfile({ remindAt: n })} />
            </Row>
          ) : null}
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="body" style={{ flex: 1 }}>{t('setRemindWeigh')}</Txt>
            <Toggle value={profile.remindWeighIn} onChange={(v) => setProfile({ remindWeighIn: v })} />
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="body" style={{ flex: 1 }}>{t('setRemindSteps')}</Txt>
            <Toggle value={profile.remindSteps} onChange={(v) => setProfile({ remindSteps: v })} />
          </Row>
          <Btn kind="secondary" small title={t('setTestNotif')} onPress={async () => {
            const ok = await sendTest(profile, upcomingDay(profile, program).key);
            toast(ok ? t('setTestSent') : t('setNotifDenied'), !ok);
          }} />
          <Divider />
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="body" style={{ flex: 1 }}>{t('setRecovery')}</Txt>
            <Toggle value={profile.recovery} onChange={(v) => setProfile({ recovery: v })} />
          </Row>
          <Btn kind="danger" small title={t('setRestore')} onPress={() => {
            if (Date.now() - restoreArm > 3000) { setRestoreArm(Date.now()); toast(t('setRestoreConfirm')); return; }
            setProgram(null);
            toast(t('setRestored'));
          }} />
        </Card>
      </View>
    </ScrollView>
  );
}
