import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { ImageAttach } from '@/components/ImageAttach';
import { Badge, Body, Bullets, Button, Card, Chip, Disclaimer, Field, H1, H2, Row, Screen } from '@/components/ui';
import { spotCheck, type SpotResult } from '@/lib/api';
import type { PickedImage } from '@/lib/image';
import { useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { findLaw, findOffence } from '@/lib/search';
import { space, useTheme } from '@/lib/theme';

const EXAMPLES = [
  'Two-wheeler, rider and pillion without helmets, rider has no licence on him',
  'Truck stopped on the highway, looks overloaded, permit for another state',
  'Car with dark tinted glass and a fancy number plate',
  'Driver smells of alcohol after a minor collision, no injuries',
];

function List({ title, icon, items }: { title: string; icon: React.ComponentProps<typeof Ionicons>['name']; items: string[] }) {
  const c = useTheme();
  if (!items.length) return null;
  return (
    <Card>
      <Row>
        <Ionicons name={icon} size={18} color={c.accent} />
        <H2>{title}</H2>
      </Row>
      <Bullets items={items} />
    </Card>
  );
}

function SpotResultView({ r }: { r: SpotResult }) {
  const c = useTheme();
  const { lang } = useT();
  const hi = lang === 'hi';
  return (
    <View style={{ gap: space.md }}>
      <Card style={{ backgroundColor: c.primary, borderColor: c.primary }}>
        <Text style={{ color: c.primaryText, fontSize: 16, fontWeight: '700', lineHeight: 22 }}>{r.summary}</Text>
        <Text style={{ color: c.primaryText, opacity: 0.8, fontSize: 12 }}>Confidence: {r.confidence}</Text>
      </Card>

      {r.offences.length ? (
        <Card>
          <H2>{hi ? 'लागू अपराध' : 'Offences that apply'}</H2>
          {r.offences.map((o, i) => {
            const linked = o.knowledgeId && (findLaw(o.knowledgeId) || findOffence(o.knowledgeId));
            return (
              <View key={i} style={{ gap: space.xs, paddingVertical: space.sm, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
                <Row wrap>
                  <Badge label={o.reference} tone="danger" />
                  {o.licenceSeizable ? <Badge label="Licence can be seized" tone="accent" /> : null}
                </Row>
                <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>{o.title}</Text>
                <Body>{o.penalty}</Body>
                {o.notes ? <Body muted>{o.notes}</Body> : null}
                {linked ? (
                  <Text accessibilityRole="link" onPress={() => router.push(`/law/${o.knowledgeId}`)} style={{ color: c.info, fontWeight: '600' }}>
                    Open in library →
                  </Text>
                ) : null}
              </View>
            );
          })}
        </Card>
      ) : null}

      <List title={hi ? 'प्रक्रिया' : 'What to do, in order'} icon="list-outline" items={r.procedure} />
      <List title={hi ? 'जाँचें' : 'Check these'} icon="document-text-outline" items={r.documentsToCheck} />
      <List title={hi ? 'चालक को दें' : 'Give to the driver / owner'} icon="hand-left-outline" items={r.giveToPerson} />
      <List title={hi ? 'साक्ष्य दर्ज करें' : 'Record as evidence'} icon="camera-outline" items={r.evidence} />
      {r.cautions.length ? (
        <Card style={{ borderColor: c.danger }}>
          <Row>
            <Ionicons name="warning-outline" size={18} color={c.danger} />
            <H2>{hi ? 'सावधान' : 'Be careful'}</H2>
          </Row>
          <Bullets items={r.cautions} />
        </Card>
      ) : null}
      <Button label={hi ? 'इसके लिए दस्तावेज़ बनाएँ' : 'Draft a memo or acknowledgement'} icon="create-outline" variant="secondary" onPress={() => router.push('/drafts')} />
    </View>
  );
}

export default function Spot() {
  const c = useTheme();
  const { lang, t } = useT();
  const { profile } = useProfile();
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SpotResult | null>(null);
  const hi = lang === 'hi';

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { result } = await spotCheck(description, image ? { base64: image.base64, mediaType: image.mediaType } : undefined, profile);
      setResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('aiUnavailable'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <H1>{hi ? 'मौके पर सहायक' : 'On-the-spot assistant'}</H1>
      <Body muted>
        {hi
          ? 'स्थिति बताइए या फ़ोटो लीजिए। आपको लागू धाराएँ, दंड, प्रक्रिया और चालक को क्या देना है, मिलेगा।'
          : 'Describe the situation or take a photo. Get the sections that apply, the penalty, the procedure, and what to hand the driver.'}
      </Body>
      <Field
        label={hi ? 'क्या हुआ?' : 'What is happening?'}
        placeholder="e.g. Auto-rickshaw carrying 7 passengers, driver has no badge"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />
      <Row wrap>
        {EXAMPLES.map((e) => (
          <Chip key={e} label={e} onPress={() => setDescription(e)} />
        ))}
      </Row>
      <ImageAttach label={hi ? 'फ़ोटो (वैकल्पिक)' : 'Photo (optional)'} value={image} onChange={setImage} />
      <Button
        label={loading ? (hi ? 'विश्लेषण हो रहा है…' : 'Checking the law…') : hi ? 'क्या लागू होता है?' : 'What applies?'}
        icon="flash-outline"
        loading={loading}
        disabled={!description.trim() && !image}
        onPress={run}
      />
      {error ? (
        <Card style={{ borderColor: c.danger }}>
          <Body style={{ color: c.danger }}>{error}</Body>
        </Card>
      ) : null}
      {result ? <SpotResultView r={result} /> : null}
      <Body muted>{hi ? 'AI सलाह देता है; निर्णय अधिकारी का है।' : 'The AI advises; the officer decides.'}</Body>
      <Disclaimer />
    </Screen>
  );
}
