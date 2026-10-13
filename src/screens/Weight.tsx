import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { Btn, Card, Divider, Field, Row, Txt, useDir, useToast } from '../components/ui';
import { currentWeight, etaDate, overallRate, targetRate, targets, todayISO, trend, type TrendStatus } from '../logic/nutrition';
import { useApp } from '../store';
import { fonts, radius, usePalette } from '../theme';

const toNum = (v: string) => {
  const s = v.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776)).replace(/[٫,،]/g, '.').trim();
  return s === '' ? NaN : Number(s);
};
const shiftDate = (iso: string, days: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return todayISO(new Date(y, m - 1, d + days));
};
const lastFriday = () => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 2) % 7)); return todayISO(d); };
const nextFriday = () => { const d = new Date(); d.setDate(d.getDate() + (((5 - d.getDay() + 7) % 7) || 7)); return todayISO(d); };
const sign = (n: number, dp = 1) => (n >= 0 ? '+' : '') + n.toFixed(dp);

export function AlertCard({ status, compact }: { status: TrendStatus; compact?: boolean }) {
  const { t, profile, setProfile, data } = useApp();
  const P = usePalette();
  const toast = useToast();
  if (status.kind === 'early') return null;
  let title = '', body = '', tone: 'good' | 'warn' | 'bad' = 'good';
  let apply: number | null = null;
  if (status.kind === 'reached') { title = t('al_reached_t'); body = t('al_reached_d'); }
  else if (status.kind === 'missed') { title = t('al_missed_t', { d: status.days }); body = t('al_missed_d'); tone = 'warn'; }
  else if (status.kind === 'ok') { title = t('al_ok_t', { rate: sign(status.rate, 2) }); body = t('al_ok_d'); }
  else {
    const kind = status.kind; // slow | fast
    const g = profile.goal;
    title = t(('al_' + kind + '_' + g + '_t') as never, { rate: sign(status.rate, 2) });
    body = t(('al_' + kind + '_' + g + '_d') as never, { kcal: Math.abs(status.kcal) });
    tone = kind === 'slow' && g === 'bulk' ? 'bad' : 'warn';
    apply = status.kcal;
  }
  const bg = { good: P.goodSoft, warn: P.plateSoft, bad: P.badSoft }[tone];
  const fg = { good: P.good, warn: P.plate, bad: P.bad }[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.md, padding: 12, gap: 4 }}>
      <Txt v="body" bold style={{ color: fg }}>{title}</Txt>
      <Txt v="muted" color="fg">{body}</Txt>
      {apply != null && !compact ? (
        <Btn small kind="secondary" title={t('al_apply')} style={{ alignSelf: 'stretch', marginTop: 4 }} onPress={() => {
          const calAdjust = profile.calAdjust + apply!;
          setProfile({ calAdjust });
          const kcal = targets({ ...profile, calAdjust }, currentWeight(profile, data.weights)).kcal;
          toast(t('al_applied', { kcal }));
        }} />
      ) : null}
    </View>
  );
}

function WeightChart({ width }: { width: number }) {
  const { data, profile, t } = useApp();
  const P = usePalette();
  const w = data.weights;
  if (!w.length) return null;
  const H = 190, pad = { l: 34, r: 10, t: 12, b: 24 };
  const t0 = new Date(w[0].date).getTime();
  const tEnd = Math.max(new Date(w[w.length - 1].date).getTime(), t0 + 8 * 6048e5);
  const rate = targetRate(profile, w[0].kg);
  const tg = (ts: number) => w[0].kg + (rate * (ts - t0)) / 6048e5;
  const ys = w.map((x) => x.kg).concat([tg(tEnd)]);
  const lo = Math.floor(Math.min(...ys) - 0.5), hi = Math.ceil(Math.max(...ys) + 0.5);
  const X = (ts: number) => pad.l + ((width - pad.l - pad.r) * (ts - t0)) / (tEnd - t0);
  const Y = (v: number) => pad.t + ((H - pad.t - pad.b) * (hi - v)) / (hi - lo || 1);
  const step = Math.max(1, Math.ceil((hi - lo) / 4));
  const grid: number[] = [];
  for (let v = lo; v <= hi; v += step) grid.push(v);
  const weeks = Math.round((tEnd - t0) / 6048e5);
  const ticks: number[] = [];
  for (let k = 0; k <= weeks; k += Math.max(1, Math.ceil(weeks / 6))) ticks.push(k);
  const pts = w.map((x) => `${X(new Date(x.date).getTime())},${Y(x.kg)}`).join(' ');
  return (
    <View>
      <Svg width={width} height={H}>
        {grid.map((v) => (
          <React.Fragment key={v}>
            <Line x1={pad.l} x2={width - pad.r} y1={Y(v)} y2={Y(v)} stroke={P.line} strokeWidth={1} />
            <SvgText x={pad.l - 6} y={Y(v) + 4} fontSize={11} fill={P.muted} textAnchor="end" fontFamily={fonts.regular}>{v}</SvgText>
          </React.Fragment>
        ))}
        {ticks.map((k) => (
          <SvgText key={k} x={X(t0 + k * 6048e5)} y={H - 6} fontSize={11} fill={P.muted} textAnchor="middle" fontFamily={fonts.regular}>{(profile.lang === 'ar' ? 'أ' : 'W') + k}</SvgText>
        ))}
        <Line x1={X(t0)} y1={Y(tg(t0))} x2={X(tEnd)} y2={Y(tg(tEnd))} stroke={P.plate} strokeWidth={2} strokeDasharray="5 5" />
        {w.length > 1 ? <Polyline points={pts} fill="none" stroke={P.accent} strokeWidth={2.5} strokeLinejoin="round" /> : null}
        {w.map((x, i) => <Circle key={x.date} cx={X(new Date(x.date).getTime())} cy={Y(x.kg)} r={i === w.length - 1 ? 5 : 3} fill={P.accent} />)}
      </Svg>
      <Txt v="small">{t('wtChartNote')}</Txt>
    </View>
  );
}

export default function Weight() {
  const { data, profile, t, lang, putWeight, deleteWeight } = useApp();
  const P = usePalette();
  const dir = useDir();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [date, setDate] = useState(todayISO());
  const [kg, setKg] = useState('');
  const [chartW, setChartW] = useState(320);
  const w = data.weights;
  const cur = currentWeight(profile, w);
  const start = w.length ? w[0].kg : profile.startKg;
  const span = profile.goalKg - start;
  const pct = span === 0 ? 100 : Math.max(0, Math.min(100, ((cur - start) / span) * 100));
  const left = Math.abs(profile.goalKg - cur);
  const eta = etaDate(profile, w);
  const rate = overallRate(w);
  const status = trend(profile, w);
  const lf = lastFriday();
  const iso = (s: string) => '\u2066' + s + '\u2069';
  const due = w.some((x) => x.date === lf) ? t('wtDoneWeek', { date: iso(nextFriday()) }) : new Date().getDay() === 5 ? t('wtFriday') : t('wtNextFri', { date: iso(nextFriday()) });
  const etaTxt = useMemo(() => {
    if (!eta) return '';
    try { return eta.toLocaleDateString(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-US', { month: 'long', year: 'numeric' }); } catch { return todayISO(eta).slice(0, 7); }
  }, [eta, lang]);

  const onLog = () => {
    const v = toNum(kg);
    if (isNaN(v) || v < 30 || v > 250) { toast(t('wtInvalid'), true); return; }
    putWeight({ date, kg: v });
    setKg('');
    toast(t('wtSaved'));
  };

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 10, paddingBottom: 40, gap: 12 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="title">{t('wtTitle')}</Txt>
        <Txt v="muted">{t('wtEvery')}</Txt>
      </Row>
      <AlertCard status={status} />
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="h2">{t('wtGoal', { kg: profile.goalKg })}</Txt>
          <Txt v="num" color="muted">{Math.round(pct)}%</Txt>
        </Row>
        <View style={{ height: 14, borderRadius: 7, backgroundColor: P.line, overflow: 'hidden' }}>
          <View style={{ height: 14, width: `${pct}%`, borderRadius: 7, backgroundColor: P.accent, alignSelf: dir.start }} />
        </View>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="small">{t('wtLeft', { kg: left.toFixed(1) })}</Txt>
          {etaTxt ? <Txt v="small">{t('wtEta', { date: etaTxt })}</Txt> : null}
        </Row>
      </Card>
      <Row gap={8}>
        {[[cur.toFixed(1), t('wtCurrent')], [w.length > 1 ? sign(cur - start) : '—', t('wtFromStart')], [rate != null ? sign(rate, 2) : '—', t('wtPerWeek')]].map(([v, l]) => (
          <Card key={l} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 10 }}>
            <Txt v="h2" color="accent" center ltr>{v}</Txt>
            <Txt v="small" center>{l}</Txt>
          </Card>
        ))}
      </Row>
      <Card>
        <Row gap={8}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Pressable onPress={() => setDate(shiftDate(date, -1))} hitSlop={8}><Txt v="h2" color="accent">‹</Txt></Pressable>
            <Txt v="label" ltr>{date}</Txt>
            <Pressable onPress={() => date < todayISO() && setDate(shiftDate(date, 1))} hitSlop={8}><Txt v="h2" color={date < todayISO() ? 'accent' : 'line'}>›</Txt></Pressable>
          </View>
          <Field style={{ flex: 1 }} value={kg} onChangeText={setKg} keyboardType="decimal-pad" placeholder={t('kg')} filled={kg !== ''} />
        </Row>
        <Btn title={t('wtLog')} onPress={onLog} />
        <Txt v="small">{due}</Txt>
      </Card>
      <Card>
        <View onLayout={(e) => setChartW(e.nativeEvent.layout.width)}>
          <WeightChart width={chartW} />
        </View>
      </Card>
      <Card>
        {w.length ? (
          <>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt v="label" style={{ flex: 1.4 }}>{t('wtDate')}</Txt>
              <Txt v="label" style={{ flex: 1 }}>{t('wtWeight')}</Txt>
              <Txt v="label" style={{ flex: 1 }}>{t('wtDiff')}</Txt>
              <View style={{ width: 24 }} />
            </Row>
            {[...w].reverse().map((x, i, arr) => {
              const prev = arr[i + 1];
              const d = prev ? x.kg - prev.kg : null;
              return (
                <View key={x.date} style={{ gap: 8 }}>
                  <Divider />
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Txt v="body" ltr style={{ flex: 1.4, textAlign: dir.align }}>{x.date}</Txt>
                    <Txt v="num" style={{ flex: 1 }}>{x.kg.toFixed(1)}</Txt>
                    <Txt v="num" style={{ flex: 1, color: d == null ? P.muted : (profile.goal === 'cut' ? d <= 0 : d >= 0) ? P.good : P.bad }}>{d == null ? '' : sign(d)}</Txt>
                    <Pressable onPress={() => deleteWeight(x.date)} hitSlop={8} style={{ width: 24, alignItems: 'center' }} accessibilityLabel={t('delete')}><Txt v="muted">✕</Txt></Pressable>
                  </Row>
                </View>
              );
            })}
          </>
        ) : <Txt v="muted">{t('wtNone')}</Txt>}
      </Card>
    </ScrollView>
  );
}
