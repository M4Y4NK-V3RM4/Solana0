import { router } from 'expo-router';
import { ProfileForm } from '@/components/ProfileForm';
import { Body, Button, Card, H2, Screen } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';

export default function Settings() {
  const { t } = useT();
  const { reset } = useProfile();
  return (
    <Screen>
      <ProfileForm submitLabel={t('save')} onDone={() => router.back()} />
      <Card>
        <H2>About RoadNyay</H2>
        <Body muted>
          Version 0.1. The law library covers the Motor Vehicles Act, 1988 (as amended in 2019), key Central Motor Vehicles Rules, 1989, and related Bharatiya Nyaya Sanhita provisions. Your profile is stored only on this device.
        </Body>
      </Card>
      <Button
        label={t('resetProfile')}
        icon="log-out-outline"
        variant="danger"
        onPress={async () => {
          await reset();
          router.replace('/onboarding');
        }}
      />
    </Screen>
  );
}
