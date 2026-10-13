import React, { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FigureLoop, FigureStill, hasDemo } from '../components/Figure';
import { Btn, Card, Chip, Row, Txt } from '../components/ui';
import { EXERCISES, EX_BY_ID, exName, exNameEn, GROUP_ORDER, videoSearchUrl, type Group } from '../data/exercises';
import { useApp } from '../store';
import { radius, usePalette } from '../theme';

export default function Library({ openDemo }: { openDemo: (id: string) => void }) {
  const { t, lang } = useApp();
  const P = usePalette();
  const insets = useSafeAreaInsets();
  const [group, setGroup] = useState<Group | 'all'>('all');
  const groups = group === 'all' ? GROUP_ORDER : [group];
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 10, paddingBottom: 40, gap: 12 }}>
      <Txt v="title">{t('libTitle')}</Txt>
      <Txt v="muted">{t('libSub')}</Txt>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        <Chip label={lang === 'ar' ? 'الكل' : 'All'} on={group === 'all'} onPress={() => setGroup('all')} />
        {GROUP_ORDER.map((g) => <Chip key={g} label={t(('g_' + g) as never)} on={group === g} onPress={() => setGroup(g)} />)}
      </Row>
      {groups.map((g) => (
        <View key={g} style={{ gap: 8 }}>
          <Txt v="h2">{t(('g_' + g) as never)}</Txt>
          <Row gap={10} center={false} style={{ flexWrap: 'wrap' }}>
            {EXERCISES.filter((e) => e.group === g).map((e) => (
              <Pressable key={e.id} onPress={() => openDemo(e.id)} style={({ pressed }) => [{ width: '48%', backgroundColor: P.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: P.line, padding: 10, gap: 6, opacity: pressed ? 0.85 : 1 }]}>
                <View style={{ backgroundColor: P.surface2, borderRadius: radius.md, alignItems: 'center', paddingVertical: 4 }}>
                  <FigureStill id={e.id} size={130} bg={P.surface2} />
                </View>
                <Txt v="body" bold numberOfLines={2} style={{ fontSize: 14, lineHeight: 20 }}>{e.name[lang]}</Txt>
                <Txt v="small" numberOfLines={1}>{e.muscles[lang]}</Txt>
              </Pressable>
            ))}
          </Row>
        </View>
      ))}
    </ScrollView>
  );
}

export function ExerciseSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { t, lang, program, data } = useApp();
  const P = usePalette();
  const insets = useSafeAreaInsets();
  const [speed, setSpeed] = useState(1);
  const [w, setW] = useState(320);
  const e = id ? EX_BY_ID[id] : null;
  const inDays = id ? program.filter((p) => p.items.some((i) => i.ex === id)).map((p) => t(('day_' + p.key) as never)) : [];
  return (
    <Modal visible={!!id} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: P.bg }}>
        {id ? (
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 30, gap: 12 }}>
            <Row style={{ justifyContent: 'space-between' }} center={false}>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt v="h2">{exName(id, lang, data.custom)}</Txt>
                {lang === 'ar' ? <Txt v="small" ltr style={{ textAlign: 'right' }}>{exNameEn(id, data.custom)}</Txt> : null}
              </View>
              <Pressable onPress={onClose} hitSlop={10}><Txt v="body" color="accent" bold>{t('close')}</Txt></Pressable>
            </Row>
            <Card style={{ padding: 6, gap: 4 }}>
              <View onLayout={(ev) => setW(ev.nativeEvent.layout.width)} style={{ alignItems: 'center' }}>
                {hasDemo(id) ? <FigureLoop id={id} width={w} bg={P.surface} speed={speed} /> : <Txt v="muted" style={{ padding: 30 }}>{t('exNoDemo')}</Txt>}
              </View>
              {hasDemo(id) ? (
                <Row style={{ justifyContent: 'space-between', paddingHorizontal: 8, paddingBottom: 6 }}>
                  <Row gap={6}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: P.hl }} />
                    <Txt v="small">{t('exDemoNote')}</Txt>
                  </Row>
                  <Row gap={6}>
                    <Chip label={t('exSlow')} on={speed < 1} onPress={() => setSpeed(0.5)} style={{ paddingVertical: 5 }} />
                    <Chip label={t('exNormal')} on={speed === 1} onPress={() => setSpeed(1)} style={{ paddingVertical: 5 }} />
                  </Row>
                </Row>
              ) : null}
            </Card>
            {e ? (
              <>
                <Card>
                  <Row style={{ justifyContent: 'space-between' }} center={false}>
                    <Txt v="label">{t('exMuscles')}</Txt>
                    <Txt v="body" style={{ flex: 1, textAlign: lang === 'ar' ? 'left' : 'right' }}>{e.muscles[lang]}</Txt>
                  </Row>
                  <Row style={{ justifyContent: 'space-between' }} center={false}>
                    <Txt v="label">{t('exEquipment')}</Txt>
                    <Txt v="body" style={{ flex: 1, textAlign: lang === 'ar' ? 'left' : 'right' }}>{e.equipment[lang]}</Txt>
                  </Row>
                  <Txt v="small">{inDays.length ? t('exInPlan', { days: inDays.join('، ') }) : t('exNotInPlan')}</Txt>
                </Card>
                <Card>
                  <Txt v="h2">{t('exHow')}</Txt>
                  {e.cues[lang].map((c, i) => (
                    <Row key={i} gap={10} center={false}>
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: P.soft, alignItems: 'center', justifyContent: 'center' }}>
                        <Txt v="small" color="accent" bold center>{i + 1}</Txt>
                      </View>
                      <Txt v="body" style={{ flex: 1 }}>{c}</Txt>
                    </Row>
                  ))}
                </Card>
                <Card>
                  <Txt v="h2">{t('exMistakes')}</Txt>
                  {e.mistakes[lang].map((m, i) => (
                    <Row key={i} gap={10} center={false}>
                      <Txt v="body" color="bad" bold>✕</Txt>
                      <Txt v="body" style={{ flex: 1 }}>{m}</Txt>
                    </Row>
                  ))}
                </Card>
              </>
            ) : null}
            <Btn kind="secondary" title={t('exWatch')} onPress={() => Linking.openURL(videoSearchUrl(id, data.custom))} />
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}
