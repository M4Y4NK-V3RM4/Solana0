import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider } from '@/lib/profile';
import { useTheme } from '@/lib/theme';

function RootStack() {
  const c = useTheme();
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.card },
          headerTintColor: c.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="law/[id]" options={{ title: '' }} />
        <Stack.Screen name="checklist/[id]" options={{ title: '' }} />
        <Stack.Screen name="quiz" options={{ title: 'Practice test' }} />
        <Stack.Screen name="signs" options={{ title: 'Road signs' }} />
        <Stack.Screen name="fines" options={{ title: 'Fine calculator' }} />
        <Stack.Screen name="timeline" options={{ title: 'Law timeline' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="spot" options={{ title: 'On-the-spot assistant' }} />
        <Stack.Screen name="drafts" options={{ title: 'Drafts & letters' }} />
        <Stack.Screen name="draft/[id]" options={{ title: 'Draft' }} />
        <Stack.Screen name="updates" options={{ title: 'What changed' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <RootStack />
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
