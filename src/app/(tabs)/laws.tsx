import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { LawCard, OffenceCard } from '@/components/LawCards';
import { Body, Chip, Disclaimer, Field, Row, Screen } from '@/components/ui';
import { LAW_CATEGORIES } from '@/data/laws';
import { lawsFor, offencesFor } from '@/data/library';
import type { LawCategory } from '@/data/types';
import { useT } from '@/lib/i18n';
import { stateCode, useProfile } from '@/lib/profile';
import { searchAll } from '@/lib/search';
import { space } from '@/lib/theme';

type Filter = 'all' | 'offences' | LawCategory;

export default function Laws() {
  const { t, lang } = useT();
  const { profile } = useProfile();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const code = stateCode(profile);
  const hits = useMemo(() => (query.trim() ? searchAll(query, 30, code) : null), [query, code]);

  // Officials see official-only provisions first; citizens see the citizen-relevant ones first.
  const laws = useMemo(() => {
    const all = lawsFor(code);
    const list = filter === 'all' ? all : all.filter((l) => l.category === filter);
    const weight = (a: string) => (profile?.role === 'official' ? (a === 'official' ? 0 : 1) : a === 'official' ? 1 : 0);
    return [...list].sort((a, b) => weight(a.audience) - weight(b.audience));
  }, [filter, profile?.role, code]);

  return (
    <Screen>
      <Field placeholder={t('searchLaws')} value={query} onChangeText={setQuery} returnKeyType="search" accessibilityLabel={t('searchLaws')} />

      {hits ? (
        <View style={{ gap: space.md }}>
          <Body muted>
            {hits.length} {lang === 'hi' ? 'परिणाम' : 'results'}
          </Body>
          {hits.map((h) => (h.kind === 'law' ? <LawCard key={h.item.id} law={h.item} /> : <OffenceCard key={h.item.id} offence={h.item} />))}
        </View>
      ) : (
        <>
          <Row wrap>
            <Chip label={t('all')} active={filter === 'all'} onPress={() => setFilter('all')} />
            <Chip label={t('offences')} active={filter === 'offences'} onPress={() => setFilter('offences')} />
            {LAW_CATEGORIES.map((cat) => (
              <Chip key={cat.id} label={lang === 'hi' ? cat.labelHi : cat.label} active={filter === cat.id} onPress={() => setFilter(cat.id)} />
            ))}
          </Row>
          <View style={{ gap: space.md }}>
            {filter === 'offences' ? offencesFor(code).map((o) => <OffenceCard key={o.id} offence={o} />) : laws.map((l) => <LawCard key={l.id} law={l} />)}
          </View>
        </>
      )}
      <Disclaimer />
    </Screen>
  );
}
