import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { LawCard } from '@/components/LawCards';
import { Body, Card, Disclaimer, H1, H2, Row, Screen, Tile, type IconName } from '@/components/ui';
import { LAWS } from '@/data/laws';
import { useT } from '@/lib/i18n';
import { OFFICIAL_TYPES, useProfile } from '@/lib/profile';
import { space, useTheme } from '@/lib/theme';

type Action = { icon: IconName; title: string; subtitle: string; href: string };

export default function Home() {
  const c = useTheme();
  const { t, lang } = useT();
  const { profile } = useProfile();
  const official = profile?.role === 'official';
  const officialLabel = OFFICIAL_TYPES.find((o) => o.id === profile?.officialType);
  const hi = lang === 'hi';

  const citizenActions: Action[] = [
    { icon: 'scan-outline', title: hi ? 'चालान समझें' : 'Understand a challan', subtitle: hi ? 'फ़ोटो लें, AI समझाएगा' : 'Snap a photo, AI explains it', href: '/scan' },
    { icon: 'school-outline', title: t('practiceTest'), subtitle: hi ? 'लर्नर लाइसेंस की तैयारी' : 'Prepare for the learner test', href: '/quiz' },
    { icon: 'warning-outline', title: t('roadSigns'), subtitle: hi ? 'सभी संकेत सीखें' : 'Learn what each sign means', href: '/signs' },
    { icon: 'calculator-outline', title: t('fineCalculator'), subtitle: hi ? 'किस अपराध पर कितना जुर्माना' : 'What each offence costs', href: '/fines' },
  ];
  const officialActions: Action[] = [
    { icon: 'scan-outline', title: hi ? 'दस्तावेज़ स्कैन' : 'Scan a document', subtitle: hi ? 'शिकायत, नोटिस, चालान' : 'Complaints, notices, challans', href: '/scan' },
    { icon: 'clipboard-outline', title: t('checklists'), subtitle: hi ? 'फिटनेस, ड्राइविंग टेस्ट, जाँच' : 'Fitness, driving test, roadside', href: '/tools' },
    { icon: 'calculator-outline', title: t('fineCalculator'), subtitle: hi ? 'धारा अनुसार दंड' : 'Penalty by section', href: '/fines' },
    { icon: 'chatbubbles-outline', title: t('ask'), subtitle: hi ? 'धारा, शक्तियाँ, प्रक्रिया' : 'Sections, powers, procedure', href: '/ask' },
  ];
  const actions = official ? officialActions : citizenActions;

  const featuredIds = official
    ? ['mva-206', 'mva-213', 'mva-56', 'mva-210b', 'mva-136a']
    : ['enf-echallan', 'mva-129', 'mva-134a', 'mva-130', 'mva-14'];
  const featured = featuredIds.map((id) => LAWS.find((l) => l.id === id)!).filter(Boolean);

  return (
    <Screen>
      <View style={{ gap: space.xs }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <H1>
            {t('welcome')}
            {profile?.name ? `, ${profile.name}` : ''}
          </H1>
          <Pressable accessibilityRole="button" accessibilityLabel={t('settings')} onPress={() => router.push('/settings')} hitSlop={12}>
            <Ionicons name="settings-outline" size={24} color={c.text} />
          </Pressable>
        </Row>
        <Body muted>
          {official ? (hi ? officialLabel?.labelHi : officialLabel?.label) ?? t('official') : t('citizen')}
          {profile?.state ? ` · ${profile.state}` : ''}
        </Body>
      </View>

      <Card onPress={() => router.push('/ask')} style={{ backgroundColor: c.primary, borderColor: c.primary }}>
        <Row>
          <Ionicons name="sparkles" size={22} color={c.primaryText} />
          <Text style={{ color: c.primaryText, fontSize: 17, fontWeight: '800', flex: 1 }}>
            {hi ? 'कोई भी यातायात कानून का सवाल पूछें' : 'Ask any traffic law question'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={c.primaryText} />
        </Row>
        <Text style={{ color: c.primaryText, opacity: 0.85, fontSize: 13 }}>
          {official
            ? hi
              ? 'उदा. “बिना परमिट टैक्सी पर कौन-सी धारा लगेगी?”'
              : 'e.g. “Which section applies to a taxi running without a permit?”'
            : hi
              ? 'उदा. “बिना हेलमेट पर कितना जुर्माना है?”'
              : 'e.g. “What is the fine for riding without a helmet?”'}
        </Text>
      </Card>

      <H2>{t('quickActions')}</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        {actions.map((a) => (
          <Tile key={a.title} icon={a.icon} title={a.title} subtitle={a.subtitle} onPress={() => router.push(a.href as never)} />
        ))}
      </View>

      <H2>{t('forYou')}</H2>
      <View style={{ gap: space.md }}>
        {featured.map((l) => (
          <LawCard key={l.id} law={l} />
        ))}
      </View>

      <Card onPress={() => router.push('/timeline')}>
        <Row>
          <Ionicons name="time-outline" size={20} color={c.accent} />
          <Text style={{ color: c.text, fontWeight: '700', flex: 1 }}>{t('timeline')}: 1914 → today</Text>
          <Ionicons name="chevron-forward" size={18} color={c.muted} />
        </Row>
      </Card>

      <Disclaimer />
    </Screen>
  );
}
