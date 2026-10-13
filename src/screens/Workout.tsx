import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FigureStill, hasDemo } from '../components/Figure';
import { Badge, Btn, Card, Chip, Divider, Field, Row, tap, Txt, useDir, useToast } from '../components/ui';
import { EXERCISES, EX_BY_ID, exName, exNameEn, GROUP_ORDER } from '../data/exercises';
import { WEEKDAYS } from '../i18n';
import { todayISO, trend } from '../logic/nutrition';
import { dayForWeekday, upcomingDay } from '../logic/program';
import { blankWS, lastFor, useApp } from '../store';
import { fonts, radius, usePalette } from '../theme';
import type { Entry, ProgramItem, WorkoutDraft } from '../types';
import { AlertCard } from './Weight';

const toNum = (v: string | undefined) => {
  const s = String(v ?? '').replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776)).replace(/[٫,،]/g, '.').trim();
  return s === '' ? NaN : Number(s);
};
export const fmtT = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`;
};
const shiftDate = (iso: string, days: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return todayISO(dt);
};
/** keeps "8–12" from being shown as "12–8" inside Arabic text */
export const ltr = (s: string | number) => '\u2066' + s + '\u2069';
const topSet = (sets: { w: number; r: number }[]) => sets[sets.length - 1];
const isPR = (w: number, r: number, last: { sets: { w: number; r: number }[] } | null) =>
  !!last && !isNaN(w) && (w > topSet(last.sets).w || (w === topSet(last.sets).w && r > topSet(last.sets).r));

export default function Workout({ openDemo }: { openDemo: (id: string) => void }) {
  const app = useApp();
  const { data, profile, program, t, lang, setWS, saveSession, deleteSession, setProgram, addCustom } = app;
  const P = usePalette();
  const dir = useDir();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const ws = data.ws;

  const scheduled = upcomingDay(profile, program);
  const todayLift = dayForWeekday(profile, program, new Date().getDay());
  const [curKey, setCurKey] = useState<string>(ws.day ?? scheduled.key);
  const cur = program.find((p) => p.key === curKey) ?? program[0];
  const [date, setDate] = useState(todayISO());
  const [edit, setEdit] = useState(false);
  const [picker, setPicker] = useState(false);
  const [openHist, setOpenHist] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!ws.startedAt) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [ws.startedAt]);

  const key = (ex: string) => cur.key + '|' + ex;
  const exTime = (ex: string) => (ws.durs[ex] || 0) + (ws.active === ex && ws.actStart ? Date.now() - ws.actStart : 0);
  const stopActive = (w: WorkoutDraft): WorkoutDraft => {
    if (!w.active || !w.actStart) return { ...w, active: null, actStart: null };
    return { ...w, durs: { ...w.durs, [w.active]: (w.durs[w.active] || 0) + Date.now() - w.actStart }, active: null, actStart: null };
  };
  const startEx = (ex: string) => {
    if (ws.active === ex) return;
    tap();
    setWS((w0) => {
      const w = stopActive(w0);
      const now = Date.now();
      const done = { ...w.done };
      delete done[ex];
      return { ...w, active: ex, actStart: now, startedAt: w.startedAt ?? now, day: cur.key, done };
    });
  };
  const finishEx = (ex: string) => {
    tap('success');
    setWS((w0) => {
      const w = w0.active === ex ? stopActive(w0) : w0;
      return { ...w, done: { ...w.done, [ex]: true } };
    });
  };
  const rowsOf = (ex: string) => ws.draft[key(ex)] ?? [{ w: '', r: '' }];
  const setRow = (ex: string, j: number, field: 'w' | 'r', val: string) => {
    setWS((w) => {
      const rows = (w.draft[key(ex)] ?? [{ w: '', r: '' }]).map((r) => ({ ...r }));
      while (rows.length <= j) rows.push({ w: '', r: '' });
      rows[j][field] = val;
      return { ...w, draft: { ...w.draft, [key(ex)]: rows } };
    });
  };
  const addRow = (ex: string) => setWS((w) => ({ ...w, draft: { ...w.draft, [key(ex)]: [...(w.draft[key(ex)] ?? [{ w: '', r: '' }]), { w: '', r: '' }] } }));
  const removeRow = (ex: string, j: number) => setWS((w) => ({ ...w, draft: { ...w.draft, [key(ex)]: (w.draft[key(ex)] ?? []).filter((_, i) => i !== j) } }));

  const items = cur.items;
  const nDone = items.filter((i) => ws.done[i.ex]).length;
  const tr0 = trend(profile, data.weights);

  const switchDay = (k: string) => {
    setCurKey(k);
    if (ws.startedAt) setWS((w) => ({ ...w, day: k }));
  };

  const onSave = () => {
    const entries: Entry[] = [];
    const bad: string[] = [];
    let prs = 0, same = 0;
    for (const it of items) {
      const last = lastFor(data.sessions, it.ex);
      const rows = rowsOf(it.ex);
      const sec = Math.round(exTime(it.ex) / 1000);
      const touched = rows.some((r) => r.w !== '' || r.r !== '');
      if (!touched) {
        if (last) { entries.push({ ex: it.ex, sets: last.sets.map((s) => ({ ...s })), ...(sec ? { sec } : {}) }); same++; }
        continue;
      }
      const sets: { w: number; r: number }[] = [];
      rows.forEach((r, j) => {
        if (r.w === '' && r.r === '') return;
        const ref = last ? last.sets[Math.min(j, last.sets.length - 1)] : null;
        let w = toNum(r.w), reps = toNum(r.r);
        if (isNaN(w) && ref) w = ref.w;
        if (isNaN(reps) && ref) reps = ref.r;
        if (isNaN(w) || isNaN(reps) || reps <= 0) { bad.push(it.ex); return; }
        sets.push({ w, r: reps });
      });
      if (sets.length) {
        if (isPR(topSet(sets).w, topSet(sets).r, last)) prs++;
        entries.push({ ex: it.ex, sets, ...(sec ? { sec } : {}) });
      }
    }
    if (bad.length) { toast(t('wNeedBoth', { ex: exName(bad[0], lang, data.custom) }), true); return; }
    if (!entries.length) { toast(t('wNothing'), true); return; }
    const s = { id: Date.now().toString(36), date, day: cur.key, entries, ...(ws.startedAt ? { dur: Math.round((Date.now() - ws.startedAt) / 1000) } : {}) };
    saveSession(s);
    setWS(() => blankWS());
    const next = upcomingDay(profile, program, new Date(), 1);
    setCurKey(next.key);
    setDate(todayISO());
    let msg = t('wSaved');
    if (prs) msg += ' · ' + t('wSavedPR', { n: prs });
    if (same) msg += ' · ' + t('wSavedSame', { n: same });
    toast(msg);
  };

  const removeItem = (ex: string) => {
    setProgram(program.map((p) => (p.key === cur.key ? { ...p, items: p.items.filter((i) => i.ex !== ex) } : p)));
    toast(t('wRemoved', { ex: exName(ex, lang, data.custom) }));
  };
  const addItem = (ex: string, name?: string) => {
    if (cur.items.some((i) => i.ex === ex)) { toast(t('wExists'), true); return; }
    if (name) addCustom(ex, name);
    const item: ProgramItem = { ex, sets: 3, reps: '8–12', rest: 120 };
    setProgram(program.map((p) => (p.key === cur.key ? { ...p, items: [...p.items, item] } : p)));
    setPicker(false);
    toast(t('wAdded', { ex: name ?? exName(ex, lang, data.custom) }));
  };

  const [cancelArm, setCancelArm] = useState(0);
  const onCancel = () => {
    if (Date.now() - cancelArm > 3000) { setCancelArm(Date.now()); toast(t('wConfirmCancel')); return; }
    setWS(() => blankWS());
    toast(t('wCleared'));
  };

  const history = useMemo(() => [...data.sessions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1)).slice(0, 8), [data.sessions]);
  const dayLabel = (k: string) => t(('day_' + k) as never);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 10, paddingBottom: 120, gap: 12 }} stickyHeaderIndices={[3]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="title">{t('wTitle')}</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Pressable onPress={() => setDate(shiftDate(date, -1))} hitSlop={8}><Txt v="h2" color="accent">‹</Txt></Pressable>
            <Txt v="label" ltr>{date}</Txt>
            <Pressable onPress={() => date < todayISO() && setDate(shiftDate(date, 1))} hitSlop={8}><Txt v="h2" color={date < todayISO() ? 'accent' : 'line'}>›</Txt></Pressable>
          </View>
        </Row>

        <View style={{ gap: 8 }}>
          {!todayLift ? <Txt v="muted">{t('wRestToday', { day: dayLabel(scheduled.key), weekday: WEEKDAYS[lang][weekdayOf(profile.liftDays, program, scheduled.key)] })}</Txt> : null}
          {tr0.kind === 'slow' || tr0.kind === 'fast' || tr0.kind === 'missed' ? <AlertCard status={tr0} compact /> : null}
        </View>

        <Row gap={6}>
          {program.map((p) => (
            <Chip key={p.key} label={dayLabel(p.key)} on={p.key === cur.key} dot={p.key === scheduled.key} onPress={() => switchDay(p.key)} flex />
          ))}
        </Row>

        {/* sticky timer bar */}
        <View style={{ backgroundColor: P.bg, paddingVertical: 6 }}>
          <Row style={{ backgroundColor: P.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: P.line, paddingVertical: 10, paddingHorizontal: 14 }} gap={12}>
            <Text style={{ fontFamily: fonts.display, fontSize: 26, color: ws.startedAt ? P.accent : P.muted, minWidth: 70, textAlign: 'center' }}>{ws.startedAt ? fmtT(Date.now() - ws.startedAt) : '0:00'}</Text>
            <View style={{ flex: 1, gap: 5 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Txt v="small" style={{ flexShrink: 1 }}>{ws.startedAt ? t('wDoneCount', { n: nDone, total: items.length }) : t('wStartHint')}</Txt>
                {ws.startedAt ? <Pressable onPress={onCancel} hitSlop={8}><Txt v="small" color="bad" bold>{t('wCancel')}</Txt></Pressable> : null}
              </Row>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: P.line, overflow: 'hidden' }}>
                <View style={{ height: 8, width: `${items.length ? (nDone / items.length) * 100 : 0}%`, backgroundColor: P.good, borderRadius: 4, alignSelf: dir.start }} />
              </View>
            </View>
          </Row>
        </View>

        <Txt v="muted">{t('wHint')}</Txt>

        {items.map((it) => {
          const last = lastFor(data.sessions, it.ex);
          const rows = rowsOf(it.ex);
          const touched = rows.some((r) => r.w !== '' || r.r !== '');
          const lr = rows[rows.length - 1];
          const pw = isNaN(toNum(lr.w)) && last ? topSet(last.sets).w : toNum(lr.w);
          const pr = isNaN(toNum(lr.r)) && last ? topSet(last.sets).r : toNum(lr.r);
          const active = ws.active === it.ex, done = !!ws.done[it.ex];
          const time = exTime(it.ex);
          return (
            <Card key={it.ex} style={[active && { borderColor: P.accent, borderWidth: 2 }, done && { opacity: 0.75 }]}>
              <Row gap={10} center={false}>
                <Pressable onPress={() => openDemo(it.ex)} style={{ width: 58, height: 50, borderRadius: 12, backgroundColor: P.surface2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }} accessibilityLabel={t('wHowTo')}>
                  {hasDemo(it.ex) ? <FigureStill id={it.ex} size={58} bg={P.surface2} /> : <Txt v="h2" color="muted">?</Txt>}
                </Pressable>
                <Pressable style={{ flex: 1, gap: 1 }} onPress={() => openDemo(it.ex)}>
                  <Txt v="body" bold numberOfLines={2}>{exName(it.ex, lang, data.custom)}</Txt>
                  {lang === 'ar' && EX_BY_ID[it.ex] ? <Txt v="small" ltr style={{ textAlign: 'right' }}>{exNameEn(it.ex, data.custom)}</Txt> : null}
                  <Txt v="small">{t('wTarget', { sets: it.sets, reps: ltr(it.reps) })} · {t('wRest', { t: ltr(fmtT(it.rest * 1000)) })}</Txt>
                </Pressable>
                <View style={{ alignItems: dir.end, gap: 6 }}>
                  {edit ? (
                    <Pressable onPress={() => removeItem(it.ex)} hitSlop={8} style={{ padding: 4 }}><Txt v="h2" color="bad">✕</Txt></Pressable>
                  ) : active ? (
                    <Pressable onPress={() => finishEx(it.ex)} style={{ backgroundColor: P.accent, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                      <Text style={{ color: P.accentFg, fontFamily: fonts.bold, fontSize: 13 }}>● {fmtT(time)} · {t('wFinish')}</Text>
                    </Pressable>
                  ) : (
                    <Pressable onPress={() => startEx(it.ex)} style={{ backgroundColor: done ? P.goodSoft : P.soft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                      <Text style={{ color: done ? P.good : P.accent, fontFamily: fonts.bold, fontSize: 13 }}>{done ? '✓ ' + fmtT(time) : '▶ ' + t('wStart') + (time >= 1000 ? ' ' + fmtT(time) : '')}</Text>
                    </Pressable>
                  )}
                </View>
              </Row>
              <Row gap={8} style={{ flexWrap: 'wrap' }}>
                <Txt v="small">{last ? `${t('wLast')}  ${last.sets.map((s) => `${s.w}×${s.r}`).join('  ')}` : t('wFirst')}</Txt>
                {touched && isPR(pw, pr, last) ? <Badge label={t('wPR')} tone="pr" /> : !touched && last ? <Badge label={t('wSame')} tone="same" /> : null}
              </Row>
              {rows.map((r, j) => {
                const ref = last ? last.sets[Math.min(j, last.sets.length - 1)] : null;
                return (
                  <Row key={j} gap={8}>
                    <Field style={{ flex: 1 }} value={r.w} filled={r.w !== ''} keyboardType="decimal-pad" placeholder={ref ? String(ref.w) : t('wWeightPh')} onFocus={() => !active && !done && startEx(it.ex)} onChangeText={(v) => setRow(it.ex, j, 'w', v)} accessibilityLabel={t('wWeightPh')} />
                    <Field style={{ flex: 1 }} value={r.r} filled={r.r !== ''} keyboardType="number-pad" placeholder={ref ? String(ref.r) : t('wRepsPh')} onFocus={() => !active && !done && startEx(it.ex)} onChangeText={(v) => setRow(it.ex, j, 'r', v)} accessibilityLabel={t('wRepsPh')} />
                    {j ? (
                      <Pressable onPress={() => removeRow(it.ex, j)} hitSlop={8} style={{ width: 28, alignItems: 'center' }}><Txt v="h2" color="muted">−</Txt></Pressable>
                    ) : <View style={{ width: 28 }} />}
                  </Row>
                );
              })}
              <Pressable onPress={() => addRow(it.ex)} hitSlop={6} style={{ alignSelf: dir.start }}><Txt v="label" color="accent" bold>{t('wAddSet')}</Txt></Pressable>
            </Card>
          );
        })}

        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => setEdit((e) => !e)} hitSlop={8}><Txt v="label" color="accent" bold>{edit ? t('wEditDone') : t('wEdit')}</Txt></Pressable>
          {edit ? <Btn small kind="secondary" title={t('wAddEx')} onPress={() => setPicker(true)} /> : null}
        </Row>

        <Card>
          <Txt v="h2">{t('wHistory')}</Txt>
          {history.length ? history.map((s, i) => (
            <View key={s.id} style={{ gap: 6 }}>
              {i ? <Divider /> : null}
              <Pressable onPress={() => setOpenHist(openHist === s.id ? null : s.id)}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Txt v="body" bold>{dayLabel(s.day)} <Txt v="small" ltr>{s.date}</Txt></Txt>
                  <Txt v="small">{s.entries.length}{s.dur ? ' · ' + fmtT(s.dur * 1000) : ''} {openHist === s.id ? '▴' : '▾'}</Txt>
                </Row>
              </Pressable>
              {openHist === s.id ? (
                <View style={{ gap: 4 }}>
                  {s.entries.map((e) => (
                    <Row key={e.ex} style={{ justifyContent: 'space-between' }} gap={10}>
                      <Txt v="small" style={{ flex: 1 }} numberOfLines={1}>{exName(e.ex, lang, data.custom)}</Txt>
                      <Txt v="small" ltr bold>{e.sets.map((x) => `${x.w}×${x.r}`).join('  ')}{e.sec ? ` · ${fmtT(e.sec * 1000)}` : ''}</Txt>
                    </Row>
                  ))}
                  <Pressable onPress={() => {
                    if (armed !== s.id) { setArmed(s.id); setTimeout(() => setArmed((a) => (a === s.id ? null : a)), 3000); return; }
                    deleteSession(s.id); setArmed(null); toast(t('wDeleted'));
                  }} style={{ alignSelf: dir.start, paddingVertical: 4 }}>
                    <Txt v="small" color="bad" bold>{armed === s.id ? t('wConfirmDelete') : t('wDeleteSession')}</Txt>
                  </Pressable>
                </View>
              ) : null}
            </View>
          )) : <Txt v="muted">{t('wNoHistory')}</Txt>}
        </Card>
      </ScrollView>

      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 10, paddingHorizontal: 16 }}>
        <Btn title={t('wSave')} onPress={onSave} style={{ shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }} />
      </View>

      <ExercisePicker visible={picker} onClose={() => setPicker(false)} onPick={addItem} exclude={cur.items.map((i) => i.ex)} />
    </View>
  );
}

function weekdayOf(liftDays: number[], program: { key: string }[], key: string): number {
  const sorted = [...liftDays].sort((a, b) => a - b);
  const today = new Date().getDay();
  // the next weekday (from today) whose slot maps to this program day
  for (let k = 0; k < 7; k++) {
    const wd = (today + k) % 7;
    const idx = sorted.indexOf(wd);
    if (idx >= 0 && program[idx % program.length]?.key === key) return wd;
  }
  return today;
}

function ExercisePicker({ visible, onClose, onPick, exclude }: { visible: boolean; onClose: () => void; onPick: (id: string, name?: string) => void; exclude: string[] }) {
  const { t, lang } = useApp();
  const P = usePalette();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: P.bg }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 30, gap: 12 }} keyboardShouldPersistTaps="handled">
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="h2">{t('wAddEx')}</Txt>
            <Pressable onPress={onClose} hitSlop={10}><Txt v="body" color="accent" bold>{t('close')}</Txt></Pressable>
          </Row>
          <Row gap={8}>
            <Field style={{ flex: 1, textAlign: lang === 'ar' ? 'right' : 'left' }} value={name} onChangeText={setName} placeholder={t('wCustomName')} />
            <Btn small title={t('add')} onPress={() => { const n = name.trim(); if (!n) return; onPick('c:' + n, n); setName(''); }} />
          </Row>
          {GROUP_ORDER.map((g) => {
            const list = EXERCISES.filter((e) => e.group === g && !exclude.includes(e.id));
            if (!list.length) return null;
            return (
              <View key={g} style={{ gap: 6 }}>
                <Txt v="label">{t(('g_' + g) as never)}</Txt>
                {list.map((e) => (
                  <Pressable key={e.id} onPress={() => onPick(e.id)} style={{ backgroundColor: P.surface, borderRadius: 12, borderWidth: 1, borderColor: P.line, padding: 10 }}>
                    <Row gap={10}>
                      <FigureStill id={e.id} size={44} bg={P.surface} />
                      <View style={{ flex: 1 }}>
                        <Txt v="body" bold>{e.name[lang]}</Txt>
                        <Txt v="small">{e.muscles[lang]}</Txt>
                      </View>
                    </Row>
                  </Pressable>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}
