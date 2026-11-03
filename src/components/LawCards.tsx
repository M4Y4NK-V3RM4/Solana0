import { router } from 'expo-router';
import { Text, View } from 'react-native';
import type { LawEntry, Offence } from '@/data/types';
import { useT } from '@/lib/i18n';
import { space, useTheme } from '@/lib/theme';
import { Badge, Card, Row } from './ui';

export function LawCard({ law }: { law: LawEntry }) {
  const c = useTheme();
  const { pick } = useT();
  return (
    <Card onPress={() => router.push(`/law/${law.id}`)}>
      <Row wrap>
        <Badge label={`${law.source} · ${law.ref}`} />
        {law.jurisdiction && law.jurisdiction !== 'central' ? <Badge label={law.jurisdiction} tone="accent" /> : null}
        {law.audience === 'official' ? <Badge label="Officials" tone="accent" /> : null}
        {law.verified ? <Badge label="Verified" tone="success" /> : null}
      </Row>
      <Text style={{ color: c.text, fontSize: 16, fontWeight: '700' }}>{pick(law.title, law.titleHi)}</Text>
      <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19 }} numberOfLines={2}>
        {law.summary}
      </Text>
    </Card>
  );
}

export function OffenceCard({ offence }: { offence: Offence }) {
  const c = useTheme();
  const { t, pick } = useT();
  return (
    <Card onPress={() => router.push(`/law/${offence.id}`)}>
      <Row wrap>
        <Badge label={`MV Act s.${offence.section}`} tone="danger" />
        {offence.jurisdiction && offence.jurisdiction !== 'central' ? <Badge label={`${offence.jurisdiction} amount`} tone="accent" /> : null}
        {offence.licenceSeizable ? <Badge label="Licence can be seized" tone="accent" /> : null}
      </Row>
      <Text style={{ color: c.text, fontSize: 16, fontWeight: '700' }}>{pick(offence.title, offence.titleHi)}</Text>
      <View style={{ gap: space.xs }}>
        <Text style={{ color: c.text, fontSize: 13 }}>
          <Text style={{ fontWeight: '700' }}>{t('firstOffence')}: </Text>
          {offence.first}
        </Text>
        {offence.subsequent ? (
          <Text style={{ color: c.muted, fontSize: 13 }}>
            <Text style={{ fontWeight: '700' }}>{t('repeatOffence')}: </Text>
            {offence.subsequent}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
