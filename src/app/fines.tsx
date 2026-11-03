import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Bullets, Card, Chip, Disclaimer, Field, H2, Row, Screen } from '@/components/ui';
import { OFFENCES } from '@/data/offences';
import { estimateFine, rupees } from '@/lib/fines';
import { useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { radius, space, useTheme } from '@/lib/theme';

export default function Fines() {
  const c = useTheme();
  const { pick } = useT();
  const { profile } = useProfile();
  const params = useLocalSearchParams<{ offence?: string }>();
  const [selected, setSelected] = useState<string[]>(params.offence ? [params.offence] : []);
  const [filter, setFilter] = useState('');
  const [tonnes, setTonnes] = useState('0');
  const [passengers, setPassengers] = useState('1');
  const [isOfficer, setIsOfficer] = useState(false);

  const list = OFFENCES.filter((o) => (o.title + o.section + o.tags.join(' ')).toLowerCase().includes(filter.toLowerCase()));
  const results = useMemo(
    () =>
      selected
        .map((id) => OFFENCES.find((o) => o.id === id)!)
        .filter(Boolean)
        .map((o) => ({ o, r: estimateFine({ offence: o, excessTonnes: Number(tonnes) || 0, excessPassengers: Number(passengers) || 1, isOfficer }) })),
    [selected, tonnes, passengers, isOfficer],
  );
  const total = results.reduce((acc, { r }) => ({ min: acc.min + r.min, max: acc.max + r.max }), { min: 0, max: 0 });

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <Screen>
      <Body muted>Select one or more offences to see the central first-offence fine. Your state may compound at a different amount.</Body>

      <Card style={{ backgroundColor: c.primary, borderColor: c.primary }}>
        <Text style={{ color: c.primaryText, opacity: 0.8, fontWeight: '700', fontSize: 12 }}>ESTIMATED TOTAL</Text>
        <Text style={{ color: c.primaryText, fontSize: 28, fontWeight: '800' }}>
          {selected.length ? (total.min === total.max ? rupees(total.max) : `${rupees(total.min)} – ${rupees(total.max)}`) : '—'}
        </Text>
        <Text style={{ color: c.primaryText, opacity: 0.8, fontSize: 12 }}>{selected.length} offence(s) selected</Text>
      </Card>

      {selected.includes('off-194') ? <Field label="Excess load (tonnes)" keyboardType="numeric" value={tonnes} onChangeText={setTonnes} /> : null}
      {selected.includes('off-194a') ? <Field label="Excess passengers" keyboardType="numeric" value={passengers} onChangeText={setPassengers} /> : null}
      {profile?.role === 'official' ? (
        <Row>
          <Chip label="Offender is an enforcing officer (s.210B, ×2)" active={isOfficer} onPress={() => setIsOfficer((v) => !v)} />
        </Row>
      ) : null}

      {results.map(({ o, r }) => (
        <Card key={o.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ color: c.text, fontWeight: '700', flex: 1 }}>
              s.{o.section} · {pick(o.title, o.titleHi)}
            </Text>
            <Text style={{ color: c.text, fontWeight: '800' }}>{r.min === r.max ? rupees(r.max) : `${rupees(r.min)}–${rupees(r.max)}`}</Text>
          </Row>
          <Body muted>{o.first}</Body>
          {r.notes.length ? <Bullets items={r.notes} /> : null}
        </Card>
      ))}

      <H2>Offences</H2>
      <Field placeholder="Filter offences…" value={filter} onChangeText={setFilter} />
      <View style={{ gap: space.sm }}>
        {list.map((o) => {
          const on = selected.includes(o.id);
          return (
            <Pressable
              key={o.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => toggle(o.id)}
              style={{ flexDirection: 'row', gap: space.md, alignItems: 'center', padding: space.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: on ? c.accent : c.border, backgroundColor: on ? c.accentSoft : c.card }}
            >
              <Text style={{ color: c.accent, fontWeight: '800', width: 54 }}>{o.section}</Text>
              <Text style={{ color: c.text, flex: 1 }}>{pick(o.title, o.titleHi)}</Text>
            </Pressable>
          );
        })}
      </View>
      <Disclaimer />
    </Screen>
  );
}
