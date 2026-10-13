import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Card, Chip, Field, Row, Txt, useToast } from '../components/ui';
import { todayISO } from '../logic/nutrition';
import { defaultLiftDays } from '../logic/program';
import { useApp } from '../store';
import { fonts, usePalette } from '../theme';
import type { DaysPerWeek, Goal } from '../types';

const toNum = (v: string) => {
  const s = v.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776)).replace(/[٫,،]/g, '.').trim();
  return s === '' ? NaN : Number(s);
};

/** First-run setup: the user's own details, goal and training days. */
export default function Onboarding() {
  const { profile, t, lang, setLang, completeSetup } = useApp();
  const P = usePalette();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [sex, setSex] = useState(profile.sex);
  const [days, setDays] = useState<DaysPerWeek>(profile.days);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goalKg, setGoalKg] = useState('');

  const start = () => {
    const a = toNum(age), h = toNum(height), w = toNum(weight);
    const g = goal === 'maintain' ? w : toNum(goalKg);
    if (isNaN(a) || a < 13 || a > 90) return toast(t('obCheck', { field: t('setAge') }), true);
    if (isNaN(h) || h < 120 || h > 230) return toast(t('obCheck', { field: t('setHeight') }), true);
    if (isNaN(w) || w < 30 || w > 250) return toast(t('obCheck', { field: t('obCurrent') }), true);
    if (isNaN(g) || g < 30 || g > 250) return toast(t('obCheck', { field: t('obGoalKg') }), true);
    if (goal === 'bulk' && g <= w) return toast(t('obGoalBulk'), true);
    if (goal === 'cut' && g >= w) return toast(t('obGoalCut'), true);
    completeSetup(
      { ...profile, lang, sex, goal, days, liftDays: defaultLiftDays(days), age: Math.round(a), heightCm: h, startKg: w, goalKg: g, calAdjust: 0 },
      todayISO(),
    );
  };

  const field = (label: string, value: string, set: (v: string) => void, placeholder: string) => (
    <Row style={{ justifyContent: 'space-between' }}>
      <Txt v="body" style={{ flex: 1 }}>{label}</Txt>
      <Field style={{ width: 104 }} value={value} onChangeText={set} keyboardType="decimal-pad" placeholder={placeholder} filled={value !== ''} accessibilityLabel={label} />
    </Row>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: P.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, gap: 14 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
    >
      <Row style={{ justifyContent: 'flex-end' }} gap={6}>
        <Chip label="العربية" on={lang === 'ar'} onPress={() => setLang('ar')} />
        <Chip label="English" on={lang === 'en'} onPress={() => setLang('en')} />
      </Row>

      <View style={{ gap: 4 }}>
        <Txt v="title" style={{ fontFamily: fonts.display, fontSize: 40, lineHeight: 52, color: P.accent }}>{t('appName')}</Txt>
        <Txt v="muted">{t('obSub')}</Txt>
      </View>

      <Card>
        <Txt v="h2">{t('obGoal')}</Txt>
        <Row gap={6}>
          {(['bulk', 'maintain', 'cut'] as Goal[]).map((g) => (
            <Chip key={g} flex label={t(('goal_' + g) as never)} on={goal === g} onPress={() => setGoal(g)} />
          ))}
        </Row>
      </Card>

      <Card>
        <Txt v="h2">{t('obAbout')}</Txt>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="body">{t('setSex')}</Txt>
          <Row gap={6}>
            <Chip label={t('sex_m')} on={sex === 'm'} onPress={() => setSex('m')} />
            <Chip label={t('sex_f')} on={sex === 'f'} onPress={() => setSex('f')} />
          </Row>
        </Row>
        {field(t('setAge'), age, setAge, '25')}
        {field(t('setHeight'), height, setHeight, '175')}
        {field(t('obCurrent'), weight, setWeight, '70')}
        {goal !== 'maintain' ? field(t('obGoalKg'), goalKg, setGoalKg, goal === 'cut' ? '65' : '75') : null}
      </Card>

      <Card>
        <Txt v="h2">{t('obDays')}</Txt>
        <Row gap={6}>
          {([3, 4, 5] as DaysPerWeek[]).map((n) => <Chip key={n} flex label={String(n)} on={days === n} onPress={() => setDays(n)} />)}
        </Row>
      </Card>

      <Btn title={t('obStart')} onPress={start} />
    </ScrollView>
  );
}
