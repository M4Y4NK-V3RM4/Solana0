import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, Share, Text, View } from 'react-native';
import { Body, Button, Card, Field, H1, H2, Row, Screen } from '@/components/ui';
import { CHECKLISTS } from '@/data/checklists';
import { buildReport, MARKS, type ItemState } from '@/lib/report';
import { useProfile } from '@/lib/profile';
import { radius, space, useTheme } from '@/lib/theme';

export function generateStaticParams() {
  return CHECKLISTS.map((c) => ({ id: c.id }));
}

export default function ChecklistScreen() {
  const c = useTheme();
  const { profile } = useProfile();
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = CHECKLISTS.find((x) => x.id === id);
  const [state, setState] = useState<Record<string, ItemState>>({});
  const [header, setHeader] = useState<Record<string, string>>({ 'Vehicle / reference no.': '', Place: '', Officer: profile?.name ?? '' });
  const [report, setReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!list) {
    return (
      <Screen>
        <H1>Not found</H1>
      </Screen>
    );
  }
  const total = list.sections.reduce((n, s) => n + s.items.length, 0);
  const marked = Object.values(state).filter((s) => s.mark).length;
  const defects = Object.values(state).filter((s) => s.mark === 'defect').length;
  const set = (key: string, patch: ItemState) => setState((s) => ({ ...s, [key]: { ...s[key], ...patch } }));

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Checklist' }} />
      <H1>{list.title}</H1>
      <Body muted>
        {list.for} · {list.basis}
      </Body>
      <Card>
        {Object.keys(header).map((k) => (
          <Field key={k} label={k} value={header[k]} onChangeText={(v) => setHeader((h) => ({ ...h, [k]: v }))} />
        ))}
      </Card>
      <Body>
        {marked} / {total} checked{defects ? ` · ${defects} defect(s)` : ''}
      </Body>
      {list.sections.map((s, si) => (
        <Card key={si}>
          <H2>{s.heading}</H2>
          {s.items.map((item, ii) => {
            const key = `${si}.${ii}`;
            const st = state[key] ?? {};
            return (
              <View key={key} style={{ gap: space.xs, paddingVertical: space.sm, borderTopWidth: ii ? 1 : 0, borderTopColor: c.border }}>
                <Text style={{ color: c.text, fontSize: 15, lineHeight: 21 }}>{item}</Text>
                <Row>
                  {MARKS.map((m) => {
                    const on = st.mark === m.id;
                    const color = m.id === 'ok' ? c.success : m.id === 'defect' ? c.danger : c.muted;
                    return (
                      <Pressable
                        key={m.id}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: on }}
                        accessibilityLabel={`${item}: ${m.label}`}
                        onPress={() => set(key, { mark: on ? undefined : m.id })}
                        style={{ paddingVertical: 6, paddingHorizontal: 14, borderRadius: radius.sm, borderWidth: 1.5, borderColor: on ? color : c.border, backgroundColor: on ? color : 'transparent' }}
                      >
                        <Text style={{ color: on ? '#fff' : c.text, fontWeight: '700', fontSize: 13 }}>{m.label}</Text>
                      </Pressable>
                    );
                  })}
                </Row>
                {st.mark === 'defect' ? <Field placeholder="Describe the defect" value={st.remark ?? ''} onChangeText={(v) => set(key, { remark: v })} /> : null}
              </View>
            );
          })}
        </Card>
      ))}
      <Button label="Generate report" icon="document-text-outline" onPress={() => setReport(buildReport(list, header, state))} />
      {report ? (
        <Card>
          <Text selectable style={{ color: c.text, fontSize: 13, lineHeight: 19, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' }) }}>
            {report}
          </Text>
          <Row wrap gap={space.md}>
            <Button
              label={copied ? 'Copied' : 'Copy report'}
              icon="copy-outline"
              variant="secondary"
              onPress={async () => {
                await Clipboard.setStringAsync(report);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            />
            {Platform.OS !== 'web' ? <Button label="Share" icon="share-outline" variant="secondary" onPress={() => Share.share({ message: report, title: list.title })} /> : null}
          </Row>
        </Card>
      ) : null}
      <Button label="Clear all" icon="refresh" variant="secondary" onPress={() => { setState({}); setReport(null); }} />
      <Body muted>Follow your state’s SOP and the latest notifications where they differ from this checklist.</Body>
    </Screen>
  );
}
