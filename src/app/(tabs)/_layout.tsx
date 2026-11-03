import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View, type ColorValue } from 'react-native';
import { useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { useTheme } from '@/lib/theme';

export default function TabsLayout() {
  const c = useTheme();
  const { t } = useT();
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }
  if (!profile) return <Redirect href="/onboarding" />;

  const icon =
    (name: React.ComponentProps<typeof Ionicons>['name']) =>
    ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} color={color as string} size={size} />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: c.card },
        headerTintColor: c.text,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('home'), headerTitle: t('appName'), tabBarIcon: icon('home-outline') }} />
      <Tabs.Screen name="laws" options={{ title: t('laws'), tabBarIcon: icon('library-outline') }} />
      <Tabs.Screen name="scan" options={{ title: t('scan'), tabBarIcon: icon('scan-outline') }} />
      <Tabs.Screen name="ask" options={{ title: t('ask'), tabBarIcon: icon('chatbubbles-outline') }} />
      <Tabs.Screen
        name="tools"
        options={{ title: profile.role === 'official' ? t('tools') : t('learn'), tabBarIcon: icon(profile.role === 'official' ? 'construct-outline' : 'school-outline') }}
      />
    </Tabs>
  );
}
