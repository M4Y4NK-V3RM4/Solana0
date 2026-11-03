import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from 'react-native';
import { Body, Chip, Disclaimer, Row } from '@/components/ui';
import { askAI, type ChatMessage } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { findLaw, findOffence } from '@/lib/search';
import { radius, space, useTheme } from '@/lib/theme';

const CITIZEN_PROMPTS = [
  'I got an e-challan for a day I wasn’t driving. What can I do?',
  'What is the fine for driving without insurance?',
  'Can police take my original licence?',
  'My 17-year-old drove my car. What happens?',
];
const OFFICIAL_PROMPTS = [
  'Which sections apply to an overloaded truck without a permit?',
  'When can I seize a driving licence on the spot?',
  'Procedure for the driving test of a commercial vehicle applicant',
  'What must I give the driver when detaining a vehicle?',
];

/** Turn "[off-194d]" style citations into tappable links into the library. */
function MessageText({ text, color }: { text: string; color: string }) {
  const c = useTheme();
  const parts = text.split(/(\[[a-z0-9-]+\])/g);
  return (
    <Text style={{ color, fontSize: 15, lineHeight: 22 }} selectable>
      {parts.map((p, i) => {
        const m = p.match(/^\[([a-z0-9-]+)\]$/);
        if (m && (findLaw(m[1]) || findOffence(m[1]))) {
          const label = findLaw(m[1])?.ref ?? `s.${findOffence(m[1])!.section}`;
          return (
            <Text key={i} onPress={() => router.push(`/law/${m[1]}`)} style={{ color: c.info, fontWeight: '700' }}>
              [{label}]
            </Text>
          );
        }
        return <Text key={i}>{p.replace(/\*\*(.+?)\*\*/g, '$1')}</Text>;
      })}
    </Text>
  );
}

export default function Ask() {
  const c = useTheme();
  const { t } = useT();
  const { profile } = useProfile();
  const params = useLocalSearchParams<{ q?: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    if (params.q) setInput(params.q);
  }, [params.q]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const { reply } = await askAI(next, profile);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('aiUnavailable'));
    } finally {
      setLoading(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    }
  }

  const prompts = profile?.role === 'official' ? OFFICIAL_PROMPTS : CITIZEN_PROMPTS;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: space.lg, gap: space.md, maxWidth: 920, width: '100%', alignSelf: 'center' }}>
        {messages.length === 0 ? (
          <View style={{ gap: space.md }}>
            <Body muted>
              {profile?.language === 'hi'
                ? 'RoadNyay लाइब्रेरी में मौजूद कानूनों के आधार पर उत्तर देता है और धारा का उल्लेख करता है।'
                : 'Answers are grounded in the RoadNyay law library and cite the section they rely on.'}
            </Body>
            <Row wrap>
              {prompts.map((p) => (
                <Chip key={p} label={p} onPress={() => send(p)} />
              ))}
            </Row>
          </View>
        ) : null}

        {messages.map((m, i) => (
          <View
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              backgroundColor: m.role === 'user' ? c.primary : c.card,
              borderColor: c.border,
              borderWidth: m.role === 'user' ? 0 : 1,
              borderRadius: radius.lg,
              padding: space.md,
            }}
          >
            <MessageText text={m.content} color={m.role === 'user' ? c.primaryText : c.text} />
          </View>
        ))}
        {loading ? <ActivityIndicator color={c.accent} style={{ alignSelf: 'flex-start' }} /> : null}
        {error ? <Text style={{ color: c.danger }}>{error}</Text> : null}
        <Disclaimer />
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: space.sm, padding: space.md, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.card }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t('askPlaceholder')}
          placeholderTextColor={c.muted}
          multiline
          onSubmitEditing={() => send()}
          style={{ flex: 1, color: c.text, fontSize: 15, maxHeight: 120, paddingHorizontal: space.md, paddingVertical: 10, borderRadius: radius.md, backgroundColor: c.bg }}
          accessibilityLabel={t('askPlaceholder')}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('send')}
          onPress={() => send()}
          disabled={!input.trim() || loading}
          style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: input.trim() && !loading ? c.accent : c.chip, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
