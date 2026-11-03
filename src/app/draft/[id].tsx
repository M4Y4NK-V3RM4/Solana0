import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Share, Text, TextInput } from 'react-native';
import { ImageAttach } from '@/components/ImageAttach';
import { Body, Bullets, Button, Card, Field, H1, H2, Row, Screen } from '@/components/ui';
import { DRAFT_TEMPLATES } from '@/data/templates';
import { writeDraft, type DraftResult } from '@/lib/api';
import type { PickedImage } from '@/lib/image';
import { useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { radius, space, useTheme } from '@/lib/theme';

export function generateStaticParams() {
  return DRAFT_TEMPLATES.map((t) => ({ id: t.id }));
}

export default function DraftScreen() {
  const c = useTheme();
  const { t, lang } = useT();
  const hi = lang === 'hi';
  const { profile } = useProfile();
  const { id } = useLocalSearchParams<{ id: string }>();
  const template = DRAFT_TEMPLATES.find((x) => x.id === id);
  const [details, setDetails] = useState('');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  if (!template) {
    return (
      <Screen>
        <H1>Not found</H1>
      </Screen>
    );
  }

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const { result } = await writeDraft(template!.id, details, image ? { base64: image.base64, mediaType: image.mediaType } : undefined, profile);
      setDraft(result);
      setBody(result.body);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('aiUnavailable'));
    } finally {
      setLoading(false);
    }
  }

  const remaining = (body.match(/\[[^\]]+\]/g) ?? []).length;

  return (
    <Screen>
      <Stack.Screen options={{ title: hi ? 'मसौदा' : 'Draft' }} />
      <H1>{hi ? template.titleHi : template.title}</H1>
      <Body muted>{template.hint}</Body>
      <Field label={hi ? 'विवरण' : 'Details'} value={details} onChangeText={setDetails} multiline style={{ minHeight: 110, textAlignVertical: 'top' }} />
      <ImageAttach label={hi ? 'दस्तावेज़ की फ़ोटो (वैकल्पिक)' : 'Photo of a related document (optional)'} value={image} onChange={setImage} />
      <Button label={loading ? (hi ? 'लिखा जा रहा है…' : 'Writing the draft…') : draft ? (hi ? 'फिर से लिखें' : 'Write again') : hi ? 'मसौदा बनाएँ' : 'Write draft'} icon="create-outline" loading={loading} disabled={!details.trim() && !image} onPress={run} />
      {error ? (
        <Card style={{ borderColor: c.danger }}>
          <Body style={{ color: c.danger }}>{error}</Body>
        </Card>
      ) : null}

      {draft ? (
        <>
          <H2>{draft.title}</H2>
          <Text style={{ color: remaining ? c.accent : c.success, fontWeight: '700' }}>
            {remaining ? `${remaining} ${hi ? 'खाली जगहें भरनी बाकी' : 'placeholders left to fill in'}` : hi ? 'सभी खाली जगहें भरी गईं' : 'All placeholders filled'}
          </Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            accessibilityLabel="Draft text"
            style={{
              minHeight: 360,
              color: c.text,
              backgroundColor: c.card,
              borderColor: c.border,
              borderWidth: 1,
              borderRadius: radius.md,
              padding: space.md,
              fontSize: 14,
              lineHeight: 21,
              textAlignVertical: 'top',
              fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' }),
            }}
          />
          <Row wrap gap={space.md}>
            <Button
              label={copied ? (hi ? 'कॉपी हो गया' : 'Copied') : hi ? 'कॉपी करें' : 'Copy'}
              icon="copy-outline"
              variant="secondary"
              onPress={async () => {
                await Clipboard.setStringAsync(body);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            />
            {Platform.OS !== 'web' ? <Button label={hi ? 'साझा करें' : 'Share'} icon="share-outline" variant="secondary" onPress={() => Share.share({ message: body, title: draft.title })} /> : null}
          </Row>
          {draft.notes.length ? (
            <Card>
              <H2>{hi ? 'भेजने से पहले जाँचें' : 'Check before sending'}</H2>
              <Bullets items={draft.notes} />
            </Card>
          ) : null}
        </>
      ) : null}
      <Body muted>{hi ? 'यह एक मसौदा है। उपयोग से पहले हर तथ्य और धारा की जाँच करें।' : 'This is a draft. Check every fact and section before you use it.'}</Body>
    </Screen>
  );
}
