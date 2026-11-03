import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { LawCard, OffenceCard } from '@/components/LawCards';
import { Badge, Body, Bullets, Button, Card, Disclaimer, H1, H2, Row, Screen } from '@/components/ui';
import { LAWS } from '@/data/laws';
import { OFFENCES } from '@/data/offences';
import { useT } from '@/lib/i18n';
import { findLaw, findOffence } from '@/lib/search';
import { space, useTheme } from '@/lib/theme';

export function generateStaticParams() {
  return [...LAWS.map((l) => ({ id: l.id })), ...OFFENCES.map((o) => ({ id: o.id }))];
}

function Related({ ids }: { ids: string[] }) {
  const { t } = useT();
  const cards = ids.flatMap((id) => {
    const l = findLaw(id);
    if (l) return [<LawCard key={id} law={l} />];
    const o = findOffence(id);
    return o ? [<OffenceCard key={id} offence={o} />] : [];
  });
  if (!cards.length) return null;
  return (
    <View style={{ gap: space.md }}>
      <H2>{t('related')}</H2>
      {cards}
    </View>
  );
}

export default function LawDetail() {
  const c = useTheme();
  const { t, pick, lang } = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const law = findLaw(id);
  const offence = law ? undefined : findOffence(id);

  if (offence) {
    // Link the offence back to provisions that mention its section.
    const relatedLaws = LAWS.filter((l) => l.related?.includes(offence.id)).map((l) => l.id);
    return (
      <Screen>
        <Stack.Screen options={{ title: `s.${offence.section}` }} />
        <Badge label={`MV Act 1988 · Section ${offence.section}`} tone="danger" />
        <H1>{pick(offence.title, offence.titleHi)}</H1>
        <Card>
          <Text style={{ color: c.muted, fontWeight: '700', fontSize: 12 }}>{t('firstOffence').toUpperCase()}</Text>
          <Body>{offence.first}</Body>
          {offence.subsequent ? (
            <>
              <Text style={{ color: c.muted, fontWeight: '700', fontSize: 12, marginTop: space.sm }}>{t('repeatOffence').toUpperCase()}</Text>
              <Body>{offence.subsequent}</Body>
            </>
          ) : null}
          {offence.extra ? <Body muted style={{ marginTop: space.sm }}>{offence.extra}</Body> : null}
          {offence.licenceSeizable ? (
            <Row style={{ marginTop: space.sm }}>
              <Ionicons name="alert-circle-outline" size={18} color={c.accent} />
              <Body style={{ flex: 1 }}>
                {lang === 'hi' ? 'धारा 206(4) के तहत पुलिस लाइसेंस ज़ब्त कर सकती है।' : 'Police can seize the licence and forward it for disqualification (Section 206(4)).'}
              </Body>
            </Row>
          ) : null}
        </Card>
        <Body muted>
          {lang === 'hi'
            ? 'ये केंद्रीय दंड हैं। राज्य अलग शमन राशि तय कर सकते हैं (धारा 200, 210A)।'
            : 'These are the central penalties. States can set different compounding amounts (Sections 200, 210A).'}
        </Body>
        <Button label={t('fineCalculator')} icon="calculator-outline" variant="secondary" onPress={() => router.push(`/fines?offence=${offence.id}`)} />
        <Related ids={relatedLaws} />
        <Disclaimer />
      </Screen>
    );
  }

  if (!law) {
    return (
      <Screen>
        <H1>Not found</H1>
        <Body muted>This provision is not in the library yet.</Body>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: law.ref }} />
      <Row wrap>
        <Badge label={`${law.source} · ${law.ref}`} />
        {law.audience === 'official' ? <Badge label="Officials" tone="accent" /> : null}
      </Row>
      <H1>{pick(law.title, law.titleHi)}</H1>
      <Body>{law.summary}</Body>
      <Card>
        <H2>{t('keyPoints')}</H2>
        <Bullets items={law.keyPoints} />
      </Card>
      {law.history ? (
        <Card>
          <Row>
            <Ionicons name="time-outline" size={18} color={c.accent} />
            <H2>{t('historyBehind')}</H2>
          </Row>
          <Body>{law.history}</Body>
        </Card>
      ) : null}
      <Button
        label={lang === 'hi' ? 'इस बारे में AI से पूछें' : 'Ask the AI about this'}
        icon="sparkles-outline"
        variant="secondary"
        onPress={() => router.push({ pathname: '/ask', params: { q: `Explain ${law.source} ${law.ref} (${law.title}) with practical examples.` } })}
      />
      <Related ids={law.related ?? []} />
      <Disclaimer />
    </Screen>
  );
}
