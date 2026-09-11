import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F7',
  border: '#DCE3EC',
  navy: '#0F172A',
  navySoft: '#1E293B',
  brand: '#1D4ED8',
  brandSoft: '#E8EEFC',
  primary: '#F59E0B',
  primaryDark: '#B45309',
  primarySoft: '#FEF3C7',
  text: '#0F172A',
  textMuted: '#51637A',
  textOnDark: '#F8FAFC',
  textOnDarkMuted: '#CBD5E1',
  onPrimary: '#1F1300',
  whatsapp: '#25D366',
  success: '#059669',
  overlay: 'rgba(9, 18, 33, 0.66)',
  overlaySoft: 'rgba(9, 18, 33, 0.45)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 44,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
};

export const typography = {
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  } as TextStyle,
  display: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.6,
  } as TextStyle,
  title: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 29,
    letterSpacing: -0.3,
  } as TextStyle,
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  } as TextStyle,
  body: {
    fontSize: 15,
    lineHeight: 23,
  } as TextStyle,
  small: {
    fontSize: 13,
    lineHeight: 19,
  } as TextStyle,
};

export const shadows: Record<'card' | 'raised', ViewStyle> = {
  card: Platform.select({
    web: { boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' } as ViewStyle,
    default: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.1,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
  }) as ViewStyle,
  raised: Platform.select({
    web: { boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16)' } as ViewStyle,
    default: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.18,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 6,
    },
  }) as ViewStyle,
};

export const layout = {
  maxWidth: 720,
};
