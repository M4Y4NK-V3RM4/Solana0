import { Ionicons } from '@expo/vector-icons';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import { Badge, Body, Bullets, Button, Card, Disclaimer, Field, H1, H2, Row, Screen } from '@/components/ui';
import { scanDocument, type ScanResult } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { findLaw, findOffence } from '@/lib/search';
import { space, useTheme } from '@/lib/theme';

interface Picked {
  uri: string;
  base64: string;
  mediaType: 'image/jpeg';
}

/** Shrink to at most 1600px on the long side and re-encode as JPEG to keep uploads small. */
async function prepare(asset: ImagePicker.ImagePickerAsset): Promise<Picked> {
  const longSide = Math.max(asset.width, asset.height);
  const ctx = ImageManipulator.manipulate(asset.uri);
  if (longSide > 1600) {
    ctx.resize(asset.width >= asset.height ? { width: 1600 } : { height: 1600 });
  }
  const rendered = await ctx.renderAsync();
  const out = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
  return { uri: out.uri, base64: out.base64 ?? '', mediaType: 'image/jpeg' };
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <Card>
      <H2>{title}</H2>
      <Bullets items={items} />
    </Card>
  );
}

function ResultView({ result }: { result: ScanResult }) {
  const c = useTheme();
  const { t } = useT();
  const tone = result.confidence === 'high' ? 'success' : result.confidence === 'medium' ? 'accent' : 'danger';
  return (
    <View style={{ gap: space.md }}>
      <Card>
        <Row wrap>
          <Badge label={result.documentType || t('documentType')} />
          <Badge label={`Confidence: ${result.confidence}`} tone={tone} />
        </Row>
        {result.issuedBy ? <Body muted>{result.issuedBy}</Body> : null}
        <Body>{result.summary}</Body>
      </Card>

      {!result.isTrafficRelated ? (
        <Card>
          <Body>This does not look like a traffic or transport document, so the legal analysis may not apply.</Body>
        </Card>
      ) : null}

      {result.keyFacts.length ? (
        <Card>
          <H2>{t('whatItSays')}</H2>
          {result.keyFacts.map((f, i) => (
            <Row key={i} style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ color: c.muted, fontSize: 13, flex: 1 }}>{f.label}</Text>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '600', flex: 2, textAlign: 'right' }}>{f.value}</Text>
            </Row>
          ))}
        </Card>
      ) : null}

      {result.estimatedAmount ? (
        <Card style={{ backgroundColor: c.accentSoft, borderColor: c.accentSoft }}>
          <Text style={{ color: c.muted, fontWeight: '700', fontSize: 12 }}>{t('estimatedAmount').toUpperCase()}</Text>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{result.estimatedAmount}</Text>
        </Card>
      ) : null}

      {result.sections.length ? (
        <Card>
          <H2>{t('sectionsInvolved')}</H2>
          {result.sections.map((s, i) => {
            const linked = s.knowledgeId && (findLaw(s.knowledgeId) || findOffence(s.knowledgeId));
            return (
              <View key={i} style={{ gap: space.xs, paddingVertical: space.xs }}>
                <Row wrap>
                  <Badge label={s.reference} tone="danger" />
                  <Text style={{ color: c.text, fontWeight: '700', flexShrink: 1 }}>{s.title}</Text>
                </Row>
                <Body>{s.explanation}</Body>
                {linked ? (
                  <Text accessibilityRole="link" onPress={() => router.push(`/law/${s.knowledgeId}`)} style={{ color: c.info, fontWeight: '600' }}>
                    Open in library →
                  </Text>
                ) : null}
              </View>
            );
          })}
        </Card>
      ) : null}

      <Section title={t('whatHappensNext')} items={result.whatHappensNext} />
      <Section title={t('yourOptions')} items={result.options} />
      <Section title={t('deadlines')} items={result.deadlines} />
      {result.warnings.length ? (
        <Card style={{ borderColor: c.danger }}>
          <Row>
            <Ionicons name="warning-outline" size={18} color={c.danger} />
            <H2>{t('warnings')}</H2>
          </Row>
          <Bullets items={result.warnings} />
        </Card>
      ) : null}
    </View>
  );
}

export default function Scan() {
  const c = useTheme();
  const { t } = useT();
  const { profile } = useProfile();
  const [picked, setPicked] = useState<Picked | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  async function pick(fromCamera: boolean) {
    setError(null);
    setResult(null);
    try {
      if (fromCamera && Platform.OS !== 'web') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError('Camera permission is needed to take a photo.');
          return;
        }
      }
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
      const res = fromCamera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled || !res.assets[0]) return;
      setPicked(await prepare(res.assets[0]));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open the image.');
    }
  }

  async function analyse() {
    if (!picked) return;
    setLoading(true);
    setError(null);
    try {
      const { result } = await scanDocument({ base64: picked.base64, mediaType: picked.mediaType }, note, profile);
      setResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('aiUnavailable'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <H1>{t('scanTitle')}</H1>
      <Body muted>{t('scanHint')}</Body>

      {picked ? (
        <Image source={{ uri: picked.uri }} style={{ width: '100%', height: 280, borderRadius: 16, backgroundColor: c.chip }} resizeMode="contain" accessibilityLabel="Selected document" />
      ) : (
        <View style={{ height: 180, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: c.border, alignItems: 'center', justifyContent: 'center', gap: space.sm }}>
          <Ionicons name="document-text-outline" size={40} color={c.muted} />
          <Body muted style={{ textAlign: 'center', paddingHorizontal: space.lg }}>Challan · Notice · Summons · Complaint · Accident photo</Body>
        </View>
      )}

      <Row wrap gap={space.md}>
        <View style={{ flexGrow: 1, flexBasis: 160 }}>
          <Button label={t('takePhoto')} icon="camera-outline" variant="secondary" onPress={() => pick(true)} />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 160 }}>
          <Button label={t('choosePhoto')} icon="images-outline" variant="secondary" onPress={() => pick(false)} />
        </View>
      </Row>

      {picked && !result ? (
        <>
          <Field label="Anything to add? (optional)" placeholder="e.g. I was not driving that day" value={note} onChangeText={setNote} multiline />
          <Button label={loading ? t('analysing') : t('analyse')} icon="sparkles-outline" loading={loading} onPress={analyse} />
        </>
      ) : null}

      {error ? (
        <Card style={{ borderColor: c.danger }}>
          <Body style={{ color: c.danger }}>{error}</Body>
        </Card>
      ) : null}

      {result ? (
        <>
          <ResultView result={result} />
          <Button
            label={t('newScan')}
            icon="refresh"
            variant="secondary"
            onPress={() => {
              setPicked(null);
              setResult(null);
              setNote('');
            }}
          />
        </>
      ) : null}

      <Disclaimer />
    </Screen>
  );
}
