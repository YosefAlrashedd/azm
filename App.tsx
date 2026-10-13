import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic/400Regular';
import { IBMPlexSansArabic_500Medium } from '@expo-google-fonts/ibm-plex-sans-arabic/500Medium';
import { IBMPlexSansArabic_700Bold } from '@expo-google-fonts/ibm-plex-sans-arabic/700Bold';
import { ReemKufi_600SemiBold } from '@expo-google-fonts/reem-kufi/600SemiBold';
import { ReemKufi_700Bold } from '@expo-google-fonts/reem-kufi/700Bold';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { tap, ToastProvider, useDir } from './src/components/ui';
import { configureNotifications, rescheduleAll } from './src/logic/notify';
import { registerStepsTask } from './src/logic/steps';
import Library, { ExerciseSheet } from './src/screens/Library';
import Onboarding from './src/screens/Onboarding';
import Plan from './src/screens/Plan';
import Steps from './src/screens/Steps';
import Weight from './src/screens/Weight';
import Workout from './src/screens/Workout';
import { AppProvider, useApp } from './src/store';
import { fonts, usePalette } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
configureNotifications();

type Tab = 'workout' | 'library' | 'steps' | 'weight' | 'plan';

function TabIcon({ tab, color }: { tab: Tab; color: string }) {
  const p = { stroke: color, strokeWidth: 1.9, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      {tab === 'workout' ? <Path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12" {...p} /> : null}
      {tab === 'library' ? <><Rect x={4} y={4} width={7} height={7} rx={2} {...p} /><Rect x={13} y={4} width={7} height={7} rx={2} {...p} /><Rect x={4} y={13} width={7} height={7} rx={2} {...p} /><Rect x={13} y={13} width={7} height={7} rx={2} {...p} /></> : null}
      {tab === 'steps' ? <Path d="M8 3c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5zM6 15h4v3a2 2 0 0 1-4 0v-3zM16 7c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5zM14 19h4v1a2 2 0 0 1-4 0v-1z" {...p} /> : null}
      {tab === 'weight' ? <><Rect x={4} y={4} width={16} height={16} rx={4} {...p} /><Path d="M9 9l3 4M8 9h8" {...p} /></> : null}
      {tab === 'plan' ? <><Rect x={5} y={5} width={14} height={15} rx={3} {...p} /><Path d="M5 10h14M9 3v4M15 3v4" {...p} /></> : null}
    </Svg>
  );
}

function Shell() {
  const { ready, needsSetup, t, profile, program } = useApp();
  const P = usePalette();
  const dir = useDir();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('workout');
  const [demo, setDemo] = useState<string | null>(null);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // keep reminders in sync with the plan and settings
  const sig = JSON.stringify([profile.lang, profile.liftDays, profile.remindAt, profile.remindWorkout, profile.remindWeighIn, profile.goalKg, program.map((p) => p.key)]);
  useEffect(() => {
    if (!ready || needsSetup) return;
    rescheduleAll(profile, program);
    if (profile.remindSteps) registerStepsTask();
  }, [ready, needsSetup, sig]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <View style={{ flex: 1, backgroundColor: P.bg }} />;
  if (needsSetup) return <View style={{ flex: 1, backgroundColor: P.bg }}><StatusBar style="auto" /><Onboarding /></View>;

  const tabs: { k: Tab; label: string }[] = [
    { k: 'workout', label: t('tabWorkout') },
    { k: 'library', label: t('tabLibrary') },
    { k: 'steps', label: t('tabSteps') },
    { k: 'weight', label: t('tabWeight') },
    { k: 'plan', label: t('tabPlan') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: P.bg }}>
      <StatusBar style="auto" />
      <View style={{ flex: 1 }}>
        {tab === 'workout' ? <Workout openDemo={setDemo} /> : null}
        {tab === 'library' ? <Library openDemo={setDemo} /> : null}
        {tab === 'steps' ? <Steps /> : null}
        {tab === 'weight' ? <Weight /> : null}
        {tab === 'plan' ? <Plan /> : null}
      </View>
      <View style={{ flexDirection: dir.row, backgroundColor: P.surface, borderTopWidth: 1, borderTopColor: P.line, paddingBottom: Math.max(insets.bottom, 8), paddingTop: 6 }}>
        {tabs.map(({ k, label }) => {
          const on = tab === k;
          return (
            <Pressable key={k} onPress={() => { tap(); setTab(k); }} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 }} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <View style={{ transform: [{ translateY: on ? -1 : 0 }] }}><TabIcon tab={k} color={on ? P.accent : P.muted} /></View>
              <Text style={{ fontFamily: on ? fonts.bold : fonts.medium, fontSize: 11.5, color: on ? P.accent : P.muted }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      <ExerciseSheet id={demo} onClose={() => setDemo(null)} />
    </View>
  );
}

export default function App() {
  const [loaded, fontError] = useFonts({ IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_700Bold, ReemKufi_600SemiBold, ReemKufi_700Bold });
  if (!loaded && !fontError) return null;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
