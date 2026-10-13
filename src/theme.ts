import { useColorScheme } from 'react-native';

// Steel blue + bumper-plate gold on a faintly green-grey ground.
export const palettes = {
  light: {
    bg: '#F2F3F0',
    surface: '#FFFFFF',
    surface2: '#F7F8F6',
    fg: '#1B1F1D',
    muted: '#66706A',
    line: '#DDE0DB',
    accent: '#2C5A86',
    accentFg: '#FFFFFF',
    soft: '#E5EDF5',
    plate: '#B98508',
    plateSoft: '#F6ECD2',
    good: '#2F7D4F',
    goodSoft: '#E1F1E7',
    bad: '#B4421C',
    badSoft: '#F7E3DB',
    ice: '#2A7FB5',
    iceSoft: '#DDEEF8',
    // figure
    body: '#3B4642',
    bodyFar: '#A9B2AD',
    hl: '#E07A2E',
    hlFar: '#F0B98C',
    prop: '#8A938E',
    propSoft: '#D5DAD6',
  },
  dark: {
    bg: '#111413',
    surface: '#1A1E1D',
    surface2: '#202523',
    fg: '#E9ECEA',
    muted: '#98A29C',
    line: '#2C3230',
    accent: '#7FB0DE',
    accentFg: '#0E1A26',
    soft: '#1C2A37',
    plate: '#E3B23C',
    plateSoft: '#3A2F14',
    good: '#6CC08F',
    goodSoft: '#173324',
    bad: '#EE8A63',
    badSoft: '#3A1E14',
    ice: '#79C3EE',
    iceSoft: '#16303F',
    body: '#D9DFDB',
    bodyFar: '#5E6863',
    hl: '#F2944D',
    hlFar: '#8A5530',
    prop: '#77817C',
    propSoft: '#3A413E',
  },
};

export type Palette = typeof palettes.light;

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? palettes.dark : palettes.light;
}

export const fonts = {
  regular: 'IBMPlexSansArabic_400Regular',
  medium: 'IBMPlexSansArabic_500Medium',
  bold: 'IBMPlexSansArabic_700Bold',
  display: 'ReemKufi_700Bold',
  displaySemi: 'ReemKufi_600SemiBold',
};

export const radius = { sm: 10, md: 14, lg: 18, xl: 22 };
