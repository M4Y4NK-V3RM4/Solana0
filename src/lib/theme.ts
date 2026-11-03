import { useColorScheme } from 'react-native';

const light = {
  bg: '#F5F7FB',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#5B6475',
  border: '#E2E8F0',
  primary: '#0B2545',
  primaryText: '#FFFFFF',
  accent: '#F28C28',
  accentSoft: '#FFF1E3',
  success: '#15803D',
  danger: '#B91C1C',
  info: '#1D4ED8',
  chip: '#EEF2F8',
};

const dark: typeof light = {
  bg: '#0B1220',
  card: '#131C2E',
  text: '#E8EDF6',
  muted: '#9AA6BA',
  border: '#24314A',
  primary: '#9CC3FF',
  primaryText: '#0B1220',
  accent: '#F5A04A',
  accentSoft: '#3A2A18',
  success: '#4ADE80',
  danger: '#F87171',
  info: '#93C5FD',
  chip: '#1C2840',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 16 };
