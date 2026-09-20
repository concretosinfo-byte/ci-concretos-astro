import { Platform, type TextStyle, type ViewStyle } from 'react-native';

// Tokens del design system "Structural Heavy-Industrial":
// vermellón para acciones, navy estructural, ámbar de maquinaria y neutros slate.
export const colors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  navy: '#0F172A',
  navySoft: '#1E293B',
  brand: '#D32F2F',
  brandDark: '#B71C1C',
  brandSoft: '#FFDAD6',
  primary: '#D32F2F',
  primaryDark: '#B71C1C',
  primarySoft: '#FFDAD6',
  amber: '#D97706',
  amberSoft: '#FFDCC3',
  text: '#0B1C30',
  textMuted: '#475569',
  textSubtle: '#94A3B8',
  textOnDark: '#F8FAFC',
  textOnDarkMuted: '#CBD5E1',
  onPrimary: '#FFFFFF',
  whatsapp: '#059669',
  success: '#059669',
  successSoft: '#ECFDF5',
  overlay: 'rgba(15, 23, 42, 0.7)',
  overlaySoft: 'rgba(15, 23, 42, 0.5)',
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
  xs: 3,
  sm: 4,
  md: 8,
  lg: 12,
  pill: 4,
};

export const typography = {
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 16,
    textTransform: 'uppercase',
  } as TextStyle,
  display: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.6,
  } as TextStyle,
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.3,
  } as TextStyle,
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,
  body: {
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,
  small: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,
};

export const shadows: Record<'card' | 'raised', ViewStyle> = {
  card: Platform.select({
    web: { boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05)' } as ViewStyle,
    default: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.05,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
  }) as ViewStyle,
  raised: Platform.select({
    web: {
      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
    } as ViewStyle,
    default: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
  }) as ViewStyle,
};

export const layout = {
  maxWidth: 720,
};
