import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { RoadSign } from '@/components/RoadSign';
import { Body, Button, Card, H1, H2, Row, Screen } from '@/components/ui';
import { OFFICIAL_QUIZ, QUIZ } from '@/data/quiz';
import { SIGNS } from '@/data/signs';
import { useT } from '@/lib/i18n';
import { useHydrated } from '@/lib/useHydrated';
import { radius, space, useTheme } from '@/lib/theme';

const ROUND = 15;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz() {
  const c = useTheme();
  const { t, pick } = useT();
  const params = useLocalSearchParams<{ set?: string }>();
  const set = useHydrated() ? params.set : undefined;
  const bank = set === 'official' ? OFFICIAL_QUIZ : QUIZ;
  const [seed, setSeed] = useState(0);
  // Same order on the server and the first client render; shuffle after mount to avoid a hydration mismatch.
  const [questions, setQuestions] = useState(() => bank.slice(0, ROUND));
  useEffect(() => setQuestions(shuffle(bank).slice(0, ROUND)), [seed, bank]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = index >= questions.length;

  if (done) {
    // The real learner test generally needs about 60% to pass.
    const pass = score / questions.length >= 0.6;
    return (
      <Screen>
        <H1>
          {t('score')}: {score} / {questions.length}
        </H1>
        <Body>{pass ? (set === 'official' ? 'Well done — strong command of the Act.' : 'Well done — you would likely pass the learner’s licence test.') : 'Keep practising and review the explanations.'}</Body>
        <Button
          label={t('tryAgain')}
          icon="refresh"
          onPress={() => {
            setSeed((s) => s + 1);
            setIndex(0);
            setScore(0);
            setChosen(null);
          }}
        />
      </Screen>
    );
  }

  const q = questions[index];
  const sign = q.signId ? SIGNS.find((s) => s.id === q.signId) : undefined;

  return (
    <Screen>
      <Stack.Screen options={{ title: set === 'official' ? 'Exam practice (officials)' : 'Practice test' }} />
      <Body muted>
        {index + 1} / {questions.length} · {t('score')} {score}
      </Body>
      <View style={{ height: 6, backgroundColor: c.chip, borderRadius: 3 }}>
        <View style={{ width: `${(index / questions.length) * 100}%`, height: 6, backgroundColor: c.accent, borderRadius: 3 }} />
      </View>
      {sign ? (
        <View style={{ alignItems: 'center' }}>
          <RoadSign sign={sign} size={120} />
        </View>
      ) : null}
      <H2>{pick(q.question, q.questionHi)}</H2>
      <View style={{ gap: space.sm }}>
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const picked = chosen === i;
          const bg = chosen === null ? c.card : isAnswer ? '#DCFCE7' : picked ? '#FEE2E2' : c.card;
          const border = chosen === null ? c.border : isAnswer ? c.success : picked ? c.danger : c.border;
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              disabled={chosen !== null}
              onPress={() => {
                setChosen(i);
                if (isAnswer) setScore((s) => s + 1);
              }}
              style={{ padding: space.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: border, backgroundColor: bg }}
            >
              <Text style={{ color: chosen !== null && (isAnswer || picked) ? '#0F172A' : c.text, fontSize: 15 }}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
      {chosen !== null ? (
        <>
          <Card>
            <Row>
              <Text style={{ fontWeight: '800', color: chosen === q.answer ? c.success : c.danger }}>{chosen === q.answer ? t('correct') : t('wrong')}</Text>
            </Row>
            <Body>{q.explanation}</Body>
          </Card>
          <Button
            label={index + 1 === questions.length ? t('finish') : t('next')}
            icon="arrow-forward"
            onPress={() => {
              setIndex((i) => i + 1);
              setChosen(null);
            }}
          />
        </>
      ) : null}
    </Screen>
  );
}
