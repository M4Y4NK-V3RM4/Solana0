import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Badge, Body, Card, Row, Screen } from '@/components/ui';
import { IMPORTED_COUNT, updatesFor } from '@/data/library';
import { useT } from '@/lib/i18n';
import { stateCode, useProfile } from '@/lib/profile';
import { space, useTheme } from '@/lib/theme';

function formatDate(d: string) {
  const [y, m, day] = d.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return [day ? String(Number(day)) : '', m ? months[Number(m) - 1] : '', y].filter(Boolean).join(' ');
}

export default function Updates() {
  const c = useTheme();
  const { lang } = useT();
  const { profile } = useProfile();
  const code = stateCode(profile);
  const items = updatesFor(code);
  const hi = lang === 'hi';

  return (
    <Screen>
      <Body muted>
        {hi
          ? `केंद्र${profile?.state ? ` और ${profile.state}` : ''} के कानून में बदलाव, नवीनतम पहले।`
          : `Changes to central${profile?.state ? ` and ${profile.state}` : ''} law, newest first.`}
      </Body>
      {IMPORTED_COUNT === 0 ? (
        <Card style={{ backgroundColor: c.accentSoft, borderColor: c.accentSoft }}>
          <Body>
            {hi
              ? 'अभी यह फ़ीड मुख्य बदलाव दिखाती है। गज़ट अधिसूचनाएँ और परिपत्र डेटा आयात के बाद यहाँ अपने आप दिखेंगे।'
              : 'For now this feed shows the major changes. Gazette notifications and circulars appear here automatically once the research data is imported.'}
          </Body>
        </Card>
      ) : null}
      <View style={{ gap: space.md }}>
        {items.map((u) => (
          <Card key={u.id} onPress={u.lawId ? () => router.push(`/law/${u.lawId}`) : undefined}>
            <Row wrap>
              <Text style={{ color: c.accent, fontWeight: '800' }}>{formatDate(u.date)}</Text>
              <Badge label={u.jurisdiction === 'central' ? 'Central' : u.jurisdiction} tone={u.jurisdiction === 'central' ? 'info' : 'accent'} />
            </Row>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>{u.title}</Text>
            <Body muted>{u.detail}</Body>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
