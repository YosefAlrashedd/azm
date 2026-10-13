import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated, I18nManager, Pressable, StyleSheet, Text, TextInput, View,
  type StyleProp, type TextInputProps, type TextProps, type TextStyle, type ViewProps, type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../store';
import { fonts, radius, usePalette, type Palette } from '../theme';

export function tap(kind: 'light' | 'success' | 'warn' = 'light') {
  try {
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'warn') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

/** Direction helpers. Layout direction is handled here, not by the OS, so Arabic and English can switch live. */
export function useDir() {
  const { rtl } = useApp();
  const flip = rtl !== (I18nManager.isRTL === true);
  return {
    rtl,
    row: (flip ? 'row-reverse' : 'row') as ViewStyle['flexDirection'],
    align: (rtl ? 'right' : 'left') as TextStyle['textAlign'],
    start: (flip ? 'flex-end' : 'flex-start') as ViewStyle['alignItems'],
    end: (flip ? 'flex-start' : 'flex-end') as ViewStyle['alignItems'],
    writing: (rtl ? 'rtl' : 'ltr') as TextStyle['writingDirection'],
  };
}

type TxtVariant = 'body' | 'muted' | 'small' | 'title' | 'h2' | 'label' | 'big' | 'num';
type TxtProps = TextProps & { v?: TxtVariant; color?: keyof Palette; center?: boolean; bold?: boolean; ltr?: boolean };

export function Txt({ v = 'body', color, center, bold, ltr, style, ...rest }: TxtProps) {
  const P = usePalette();
  const d = useDir();
  const base: TextStyle = {
    body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: P.fg },
    muted: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 20, color: P.muted },
    small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: P.muted },
    title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 36, color: P.fg },
    h2: { fontFamily: fonts.displaySemi, fontSize: 18, lineHeight: 26, color: P.fg },
    label: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: P.muted },
    big: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: P.accent },
    num: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: P.fg },
  }[v];
  return (
    <Text
      {...rest}
      style={[
        base,
        { textAlign: center ? 'center' : ltr ? 'left' : d.align, writingDirection: ltr ? 'ltr' : d.writing },
        bold && { fontFamily: fonts.bold },
        color && { color: P[color] },
        style,
      ]}
    />
  );
}

export function Row({ style, gap = 8, center = true, ...rest }: ViewProps & { gap?: number; center?: boolean }) {
  const d = useDir();
  return <View {...rest} style={[{ flexDirection: d.row, gap, alignItems: center ? 'center' : 'stretch' }, style]} />;
}

export function Card({ style, tone, ...rest }: ViewProps & { tone?: 'plain' | 'soft' }) {
  const P = usePalette();
  return (
    <View
      {...rest}
      style={[
        { backgroundColor: tone === 'soft' ? P.soft : P.surface, borderRadius: radius.lg, borderWidth: tone === 'soft' ? 0 : StyleSheet.hairlineWidth * 2, borderColor: P.line, padding: 14, gap: 10 },
        style,
      ]}
    />
  );
}

type BtnKind = 'primary' | 'secondary' | 'ghost' | 'danger';
export function Btn({ title, onPress, kind = 'primary', small, style, disabled, icon }: { title: string; onPress: () => void; kind?: BtnKind; small?: boolean; style?: StyleProp<ViewStyle>; disabled?: boolean; icon?: string }) {
  const P = usePalette();
  const bg = { primary: P.accent, secondary: P.soft, ghost: 'transparent', danger: P.badSoft }[kind];
  const fg = { primary: P.accentFg, secondary: P.accent, ghost: P.accent, danger: P.bad }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => { tap(); onPress(); }}
      style={({ pressed }) => [
        { backgroundColor: bg, borderRadius: radius.md, paddingVertical: small ? 8 : 13, paddingHorizontal: small ? 12 : 16, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      <Text style={{ color: fg, fontFamily: fonts.bold, fontSize: small ? 13.5 : 16 }}>{icon ? icon + ' ' : ''}{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, on, onPress, dot, style, flex }: { label: string; on?: boolean; onPress: () => void; dot?: boolean; style?: StyleProp<ViewStyle>; flex?: boolean }) {
  const P = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      onPress={() => { tap(); onPress(); }}
      style={[{ paddingVertical: 9, paddingHorizontal: 12, borderRadius: radius.sm + 2, borderWidth: 1, borderColor: on ? P.accent : P.line, backgroundColor: on ? P.accent : P.surface, alignItems: 'center' }, flex && { flex: 1 }, style]}
    >
      <Text numberOfLines={1} style={{ fontFamily: fonts.bold, fontSize: 14, color: on ? P.accentFg : P.fg }}>{label}</Text>
      {dot ? <View style={{ position: 'absolute', top: 5, right: 6, width: 7, height: 7, borderRadius: 4, backgroundColor: P.plate }} /> : null}
    </Pressable>
  );
}

export function Badge({ label, tone }: { label: string; tone: 'pr' | 'same' | 'good' | 'warn' | 'bad' }) {
  const P = usePalette();
  const map = { pr: [P.plateSoft, P.plate], same: [P.soft, P.accent], good: [P.goodSoft, P.good], warn: [P.plateSoft, P.plate], bad: [P.badSoft, P.bad] } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2 }}>
      <Text style={{ color: fg, fontFamily: fonts.bold, fontSize: 11.5 }}>{label}</Text>
    </View>
  );
}

export function Field(props: TextInputProps & { filled?: boolean }) {
  const P = usePalette();
  const { filled, style, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={P.muted}
      {...rest}
      style={[{ fontFamily: fonts.medium, fontSize: 16, color: P.fg, backgroundColor: P.bg, borderWidth: 1, borderColor: filled ? P.accent : P.line, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 12, textAlign: 'center', minWidth: 0 }, style]}
    />
  );
}

export function Divider() {
  const P = usePalette();
  return <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: P.line }} />;
}

export function Stepper({ value, onChange, step = 1, min = 0, max = 9999, format }: { value: number; onChange: (n: number) => void; step?: number; min?: number; max?: number; format?: (n: number) => string }) {
  const P = usePalette();
  const btn = (label: string, d: number) => (
    <Pressable onPress={() => { tap(); onChange(Math.max(min, Math.min(max, Math.round((value + d) * 100) / 100))); }} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: P.soft, alignItems: 'center', justifyContent: 'center' }} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={{ color: P.accent, fontFamily: fonts.bold, fontSize: 18 }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {btn('−', -step)}
      <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: P.fg, minWidth: 64, textAlign: 'center' }}>{format ? format(value) : value}</Text>
      {btn('+', step)}
    </View>
  );
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const P = usePalette();
  const x = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => { Animated.timing(x, { toValue: value ? 1 : 0, duration: 160, useNativeDriver: false }).start(); }, [value, x]);
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={() => { tap(); onChange(!value); }} style={{ width: 50, height: 30, borderRadius: 15, backgroundColor: value ? P.accent : P.line, padding: 3, flexDirection: 'row' }}>
      <Animated.View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] }} />
    </Pressable>
  );
}

export function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="h2">{title}</Txt>
        {right}
      </Row>
      {children}
    </View>
  );
}

// ---------- toast ----------
type ToastFn = (msg: string, err?: boolean) => void;
const ToastCtx = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const P = usePalette();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<{ text: string; err: boolean } | null>(null);
  const y = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback<ToastFn>((text, err = false) => {
    setMsg({ text, err });
    tap(err ? 'warn' : 'success');
    Animated.spring(y, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => Animated.timing(y, { toValue: 0, duration: 200, useNativeDriver: true }).start(), err ? 4200 : 2400);
  }, [y]);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg ? (
        <Animated.View
          pointerEvents="none"
          style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, alignItems: 'center', opacity: y, transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}
        >
          <View style={{ backgroundColor: msg.err ? P.bad : P.fg, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, maxWidth: 440 }}>
            <Text style={{ color: msg.err ? '#fff' : P.bg, fontFamily: fonts.bold, fontSize: 14.5, textAlign: 'center' }}>{msg.text}</Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastCtx.Provider>
  );
}
