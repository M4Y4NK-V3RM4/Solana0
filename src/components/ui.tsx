import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT } from '@/lib/i18n';
import { radius, space, useTheme } from '@/lib/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Page container: scrollable, centered with a max width on large screens (web/desktop/tablet). */
export function Screen({ children, scroll = true, padded = true }: { children: ReactNode; scroll?: boolean; padded?: boolean }) {
  const c = useTheme();
  const inner = <View style={[styles.inner, padded && { padding: space.lg }]}>{children}</View>;
  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: c.bg }}>
      {scroll ? (
        <ScrollView contentContainerStyle={{ paddingBottom: space.xl * 2 }} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{inner}</View>
      )}
    </SafeAreaView>
  );
}

export function H1({ children }: { children: ReactNode }) {
  const c = useTheme();
  return <Text style={[styles.h1, { color: c.text }]}>{children}</Text>;
}

export function H2({ children, style }: { children: ReactNode; style?: object }) {
  const c = useTheme();
  return <Text style={[styles.h2, { color: c.text }, style]}>{children}</Text>;
}

export function Body({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: object }) {
  const c = useTheme();
  return <Text style={[styles.body, { color: muted ? c.muted : c.text }, style]}>{children}</Text>;
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: ViewStyle; onPress?: () => void }) {
  const c = useTheme();
  const base = [styles.card, { backgroundColor: c.card, borderColor: c.border }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [...base, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}) {
  const c = useTheme();
  const bg = variant === 'primary' ? c.primary : variant === 'danger' ? c.danger : c.chip;
  const fg = variant === 'secondary' ? c.text : variant === 'danger' ? '#fff' : c.primaryText;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? c.primary : c.chip }]}
    >
      <Text style={{ color: active ? c.primaryText : c.text, fontSize: 13, fontWeight: '600', flexShrink: 1 }}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, tone = 'info' }: { label: string; tone?: 'info' | 'accent' | 'danger' | 'success' }) {
  const c = useTheme();
  const color = { info: c.info, accent: c.accent, danger: c.danger, success: c.success }[tone];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function Field(props: TextInputProps & { label?: string }) {
  const c = useTheme();
  const { label, style, ...rest } = props;
  return (
    <View style={{ gap: space.xs }}>
      {label ? <Text style={{ color: c.muted, fontSize: 13, fontWeight: '600' }}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={label ?? rest.placeholder}
        placeholderTextColor={c.muted}
        style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }, style]}
        {...rest}
      />
    </View>
  );
}

export function Row({ children, gap = space.sm, wrap, style }: { children: ReactNode; gap?: number; wrap?: boolean; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>{children}</View>;
}

export function Bullets({ items }: { items: string[] }) {
  const c = useTheme();
  return (
    <View style={{ gap: space.sm }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: space.sm }}>
          <Text style={{ color: c.accent, fontSize: 15, lineHeight: 22 }}>•</Text>
          <Text style={[styles.body, { color: c.text, flex: 1 }]}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

export function Disclaimer() {
  const c = useTheme();
  const { t } = useT();
  return (
    <View style={[styles.disclaimer, { backgroundColor: c.accentSoft }]}>
      <Ionicons name="information-circle-outline" size={18} color={c.accent} />
      <Text style={{ color: c.text, fontSize: 12, lineHeight: 18, flex: 1 }}>{t('disclaimer')}</Text>
    </View>
  );
}

export function Tile({ icon, title, subtitle, onPress }: { icon: IconName; title: string; subtitle?: string; onPress: () => void }) {
  const c = useTheme();
  return (
    <Card onPress={onPress} style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: c.accentSoft }]}>
        <Ionicons name={icon} size={22} color={c.accent} />
      </View>
      <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>{title}</Text>
      {subtitle ? <Text style={{ color: c.muted, fontSize: 12, lineHeight: 17 }}>{subtitle}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  inner: { width: '100%', maxWidth: 920, alignSelf: 'center', gap: space.lg },
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  h2: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: space.lg, gap: space.sm },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingVertical: 13, paddingHorizontal: space.lg, borderRadius: radius.md, minHeight: 48 },
  buttonText: { fontSize: 15, fontWeight: '700' },
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 16, maxWidth: '100%' },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 12, fontSize: 15 },
  disclaimer: { flexDirection: 'row', gap: space.sm, padding: space.md, borderRadius: radius.md, alignItems: 'flex-start' },
  tile: { flexBasis: 160, flexGrow: 1, minHeight: 120 },
  tileIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
