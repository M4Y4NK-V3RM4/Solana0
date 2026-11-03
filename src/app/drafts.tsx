import { router } from 'expo-router';
import { View } from 'react-native';
import { Body, Card, H2, Screen } from '@/components/ui';
import { DRAFT_TEMPLATES } from '@/data/templates';
import { useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { space } from '@/lib/theme';

export default function Drafts() {
  const { lang } = useT();
  const { profile } = useProfile();
  const hi = lang === 'hi';
  const mine = profile?.role === 'official' ? 'official' : 'citizen';
  const groups = [mine, mine === 'official' ? 'citizen' : 'official'] as const;

  return (
    <Screen>
      <Body muted>
        {hi
          ? 'टेम्पलेट चुनें, विवरण भरें या दस्तावेज़ की फ़ोटो लें। AI एक मसौदा बनाएगा जिसमें खाली जगहें [कोष्ठक] में होंगी।'
          : 'Pick a template, add the details or a photo of the document. The AI writes a draft with anything it does not know left as [PLACEHOLDERS].'}
      </Body>
      {groups.map((g) => (
        <View key={g} style={{ gap: space.md }}>
          <H2>{g === 'official' ? (hi ? 'अधिकारियों के लिए' : 'For officials') : hi ? 'नागरिकों के लिए' : 'For citizens'}</H2>
          {DRAFT_TEMPLATES.filter((t) => t.audience === g).map((t) => (
            <Card key={t.id} onPress={() => router.push(`/draft/${t.id}`)}>
              <H2 style={{ fontSize: 16 }}>{hi ? t.titleHi : t.title}</H2>
              <Body muted>{t.hint}</Body>
            </Card>
          ))}
        </View>
      ))}
    </Screen>
  );
}
