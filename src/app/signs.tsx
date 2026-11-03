import { Text, View } from 'react-native';
import { RoadSign } from '@/components/RoadSign';
import { Body, Card, H2, Screen } from '@/components/ui';
import { SIGN_KINDS, SIGNS } from '@/data/signs';
import { useT } from '@/lib/i18n';
import { space, useTheme } from '@/lib/theme';

export default function Signs() {
  const c = useTheme();
  const { lang } = useT();
  return (
    <Screen>
      {(Object.keys(SIGN_KINDS) as (keyof typeof SIGN_KINDS)[]).map((kind) => (
        <View key={kind} style={{ gap: space.md }}>
          <H2>{lang === 'hi' ? SIGN_KINDS[kind].labelHi : SIGN_KINDS[kind].label}</H2>
          <Body muted>{SIGN_KINDS[kind].note}</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
            {SIGNS.filter((s) => s.kind === kind).map((s) => (
              <Card key={s.id} style={{ flexBasis: 200, flexGrow: 1, alignItems: 'center' }}>
                <RoadSign sign={s} size={84} />
                <Text style={{ color: c.text, fontWeight: '700', textAlign: 'center' }}>{lang === 'hi' ? s.nameHi : s.name}</Text>
                <Text style={{ color: c.muted, fontSize: 12, textAlign: 'center', lineHeight: 17 }}>{s.meaning}</Text>
              </Card>
            ))}
          </View>
        </View>
      ))}
      <Body muted>Sign drawings are simplified for learning. Official designs are in the First Schedule to the MV Act and IRC:67.</Body>
    </Screen>
  );
}
