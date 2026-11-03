import { Text, View } from 'react-native';
import { Body, H1, Screen } from '@/components/ui';
import { HISTORY } from '@/data/history';
import { space, useTheme } from '@/lib/theme';

export default function Timeline() {
  const c = useTheme();
  return (
    <Screen>
      <H1>How India’s road law evolved</H1>
      <View>
        {HISTORY.map((h, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: space.md }}>
            <View style={{ alignItems: 'center', width: 52 }}>
              <Text style={{ color: c.accent, fontWeight: '800' }}>{h.year}</Text>
              {i < HISTORY.length - 1 ? <View style={{ width: 2, flex: 1, backgroundColor: c.border, marginVertical: 4 }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: space.lg, gap: space.xs }}>
              <Text style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>{h.title}</Text>
              <Body muted>{h.detail}</Body>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}
