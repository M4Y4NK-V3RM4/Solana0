import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Linking, Text, View } from 'react-native';
import { LawCard, OffenceCard } from '@/components/LawCards';
import { Badge, Body, Bullets, Button, Card, Disclaimer, H1, H2, Row, Screen } from '@/components/ui';
import { LAWS, OFFENCES } from '@/data/library';
import type { Provenance } from '@/data/types';
import { useT } from '@/lib/i18n';
import { findLaw, findOffence } from '@/lib/search';
import { space, useTheme } from '@/lib/theme';

export function generateStaticParams() {
  return [...LAWS.map((l) => ({ id: l.id })), ...OFFENCES.map((o) => ({ id: o.id }))];
}

function SourceCard({ p }: { p: Provenance }) {
  const c = useTheme();
  const { lang } = useT();
  const hi = lang === 'hi';
  const sources = p.sources ?? [];
  return (
    <Card>
      <Row wrap>
        <H2>{hi ? 'स्रोत' : 'Source'}</H2>
        {p.verified ? <Badge label={hi ? 'आधिकारिक पाठ से जाँचा गया' : 'Checked against official text'} tone="success" /> : <Badge label={hi ? 'अभी जाँचा नहीं गया' : 'Not yet verified'} tone="accent" />}
        {p.jurisdiction && p.jurisdiction !== 'central' ? <Badge label={p.jurisdiction} tone="accent" /> : null}
      </Row>
      {sources.length ? (
        sources.map((s, i) => (
          <Text key={i} accessibilityRole="link" onPress={() => Linking.openURL(s.url)} style={{ color: c.info }}>
            {s.title || s.publisher || s.url}
            {s.datePublished ? ` (${s.datePublished})` : ''}
          </Text>
        ))
      ) : (
        <>
          <Body muted>
            {hi
              ? 'यह सारांश RoadNyay ने लिखा है और अभी आधिकारिक पाठ से पंक्ति-दर-पंक्ति नहीं जाँचा गया है।'
              : 'This summary was written by RoadNyay and has not yet been checked line by line against the official text.'}
          </Body>
          <Text accessibilityRole="link" onPress={() => Linking.openURL('https://www.indiacode.nic.in/')} style={{ color: c.info }}>
            {hi ? 'आधिकारिक पाठ: India Code →' : 'Official text: India Code →'}
          </Text>
        </>
      )}
      {p.effectiveFrom ? <Body muted>{hi ? 'लागू तिथि' : 'In force from'}: {p.effectiveFrom}</Body> : null}
      {p.status && p.status !== 'in_force' && p.status !== 'unknown' ? <Badge label={p.status.replace('_', ' ')} tone="danger" /> : null}
    </Card>
  );
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
        <SourceCard p={offence} />
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
      {law.keyPoints.length ? (
        <Card>
          <H2>{t('keyPoints')}</H2>
          <Bullets items={law.keyPoints} />
        </Card>
      ) : null}
      {law.text ? (
        <Card>
          <H2>{lang === 'hi' ? 'आधिकारिक पाठ' : 'Text of the law'}</H2>
          <Text selectable style={{ color: c.text, fontSize: 14, lineHeight: 21 }}>
            {law.text}
          </Text>
        </Card>
      ) : null}
      {law.history ? (
        <Card>
          <Row>
            <Ionicons name="time-outline" size={18} color={c.accent} />
            <H2>{t('historyBehind')}</H2>
          </Row>
          <Body>{law.history}</Body>
        </Card>
      ) : null}
      <SourceCard p={law} />
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
