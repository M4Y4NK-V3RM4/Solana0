import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, Card, H1, H2, Row, Screen } from '@/components/ui';
import { CHECKLISTS } from '@/data/checklists';
import { space, useTheme } from '@/lib/theme';

export function generateStaticParams() {
  return CHECKLISTS.map((c) => ({ id: c.id }));
}

export default function ChecklistScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = CHECKLISTS.find((x) => x.id === id);
  const [done, setDone] = useState<Record<string, boolean>>({});

  if (!list) {
    return (
      <Screen>
        <H1>Not found</H1>
      </Screen>
    );
  }
  const total = list.sections.reduce((n, s) => n + s.items.length, 0);
  const checked = Object.values(done).filter(Boolean).length;

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Checklist' }} />
      <H1>{list.title}</H1>
      <Body muted>
        {list.for} · {list.basis}
      </Body>
      <Body>
        {checked} / {total} checked
      </Body>
      {list.sections.map((s, si) => (
        <Card key={si}>
          <H2>{s.heading}</H2>
          <View style={{ gap: space.xs }}>
            {s.items.map((item, ii) => {
              const key = `${si}.${ii}`;
              const on = !!done[key];
              return (
                <Pressable
                  key={key}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  onPress={() => setDone((d) => ({ ...d, [key]: !on }))}
                  style={{ flexDirection: 'row', gap: space.sm, paddingVertical: 6, alignItems: 'flex-start' }}
                >
                  <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? c.success : c.muted} />
                  <Text style={{ color: c.text, fontSize: 15, lineHeight: 22, flex: 1, textDecorationLine: on ? 'line-through' : 'none' }}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      ))}
      <Row>
        <View style={{ flex: 1 }}>
          <Button label="Clear all" icon="refresh" variant="secondary" onPress={() => setDone({})} />
        </View>
      </Row>
      <Body muted>Follow your state’s SOP and the latest notifications where they differ from this checklist.</Body>
    </Screen>
  );
}
