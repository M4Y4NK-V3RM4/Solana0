import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';
import { ProfileForm } from '@/components/ProfileForm';
import { Body, H1, Screen } from '@/components/ui';
import { space, useTheme } from '@/lib/theme';

export default function Onboarding() {
  const c = useTheme();
  return (
    <Screen>
      <View style={{ gap: space.sm, paddingTop: space.xl }}>
        <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="car-sport" size={30} color={c.primaryText} />
        </View>
        <H1>RoadNyay</H1>
        <Body muted>Indian traffic and transport law, explained · भारतीय यातायात कानून, आसान भाषा में</Body>
      </View>
      <ProfileForm onDone={() => router.replace('/')} />
    </Screen>
  );
}
