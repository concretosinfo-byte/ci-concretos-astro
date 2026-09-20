import { Ionicons } from '@expo/vector-icons';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type ScrollViewProps,
} from 'react-native';

import { colors, layout, radius, shadows, spacing, typography } from '../constants/theme';

export function Screen({ children, contentContainerStyle, ...rest }: ScrollViewProps) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.screenContent, contentContainerStyle]}
      {...rest}
    >
      <View style={styles.screenInner}>{children}</View>
    </ScrollView>
  );
}

export function PageHeader({
  image,
  kicker,
  title,
  subtitle,
}: {
  image: ImageSourcePropType;
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <ImageBackground source={image} style={styles.pageHeader} imageStyle={styles.pageHeaderImage}>
      <View style={styles.pageHeaderOverlay}>
        <View style={styles.pageHeaderBody}>
          <Text style={styles.kickerOnDark}>{kicker}</Text>
          <Text style={styles.pageHeaderTitle}>{title}</Text>
          {subtitle ? <Text style={styles.pageHeaderSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </ImageBackground>
  );
}

export function Section({
  kicker,
  title,
  subtitle,
  children,
}: PropsWithChildren<{ kicker?: string; title: string; subtitle?: string }>) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.rule} />
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function Card({
  children,
  onPress,
  image,
  padded = true,
}: PropsWithChildren<{
  onPress?: () => void;
  image?: ImageSourcePropType;
  padded?: boolean;
}>) {
  const inner = (
    <>
      {image ? <Image source={image} style={styles.cardImage} resizeMode="cover" /> : null}
      <View style={padded ? styles.cardBody : undefined}>{children}</View>
    </>
  );

  if (!onPress) {
    return <View style={styles.card}>{inner}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {inner}
    </Pressable>
  );
}

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.textOnDark} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export function Bullet({ children }: PropsWithChildren) {
  return (
    <View style={styles.bulletRow}>
      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export function Badge({ children, tone = 'brand' }: PropsWithChildren<{ tone?: 'brand' | 'amber' }>) {
  const isBrand = tone === 'brand';
  return (
    <View style={[styles.badge, isBrand ? styles.badgeBrand : styles.badgeAmber]}>
      <Text style={[styles.badgeText, isBrand ? styles.badgeTextBrand : styles.badgeTextAmber]}>
        {children}
      </Text>
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'whatsapp' | 'outline' | 'outlineLight' | 'ghost';
};

const buttonForeground: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: colors.onPrimary,
  whatsapp: '#FFFFFF',
  outline: colors.navy,
  outlineLight: colors.textOnDark,
  ghost: colors.brand,
};

export function Button({ label, onPress, icon, variant = 'primary' }: ButtonProps) {
  const foreground = buttonForeground[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'whatsapp' && styles.buttonWhatsapp,
        variant === 'outline' && styles.buttonOutline,
        variant === 'outlineLight' && styles.buttonOutlineLight,
        variant === 'ghost' && styles.buttonGhost,
        pressed && styles.pressed,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={foreground} /> : null}
      <Text style={[styles.buttonLabel, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function Footnote({ children }: { children: ReactNode }) {
  return <Text style={styles.footnote}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  screenContent: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  screenInner: {
    maxWidth: layout.maxWidth,
    width: '100%',
  },
  pageHeader: {
    backgroundColor: colors.navy,
    overflow: 'hidden',
  },
  pageHeaderImage: {
    opacity: 0.9,
  },
  pageHeaderOverlay: {
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    minHeight: 180,
  },
  pageHeaderBody: {
    gap: spacing.xs,
    padding: spacing.lg,
  },
  pageHeaderTitle: {
    ...typography.title,
    color: colors.textOnDark,
  },
  pageHeaderSubtitle: {
    ...typography.body,
    color: colors.textOnDarkMuted,
  },
  kicker: {
    ...typography.kicker,
    color: colors.brand,
  },
  kickerOnDark: {
    ...typography.kicker,
    color: colors.amber,
  },
  section: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  sectionHead: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
  },
  rule: {
    backgroundColor: colors.brand,
    height: 3,
    marginTop: spacing.xs,
    width: 48,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    paddingTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardImage: {
    height: 150,
    width: '100%',
  },
  cardBody: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: colors.navy,
    borderRadius: radius.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    ...typography.small,
    color: colors.textMuted,
  },
  infoValue: {
    ...typography.cardTitle,
    color: colors.text,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletText: {
    ...typography.small,
    color: colors.textMuted,
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  badgeBrand: {
    backgroundColor: colors.navy,
  },
  badgeAmber: {
    backgroundColor: colors.amber,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  badgeTextBrand: {
    color: colors.textOnDark,
  },
  badgeTextAmber: {
    color: '#FFFFFF',
  },
  button: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonWhatsapp: {
    backgroundColor: colors.whatsapp,
  },
  buttonOutlineLight: {
    backgroundColor: 'transparent',
    borderColor: colors.textOnDark,
    borderWidth: 1.5,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderColor: colors.navy,
    borderWidth: 1.5,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.85,
  },
  footnote: {
    ...typography.small,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
});
