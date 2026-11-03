import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { LawCard } from '@/components/LawCards';
import { Body, Card, Disclaimer, H1, H2, Row, Screen, Tile, type IconName } from '@/components/ui';
import { LAWS } from '@/data/library';
import { useT } from '@/lib/i18n';
import { OFFICIAL_TYPES, stateCode, useProfile } from '@/lib/profile';
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
    { icon: 'create-outline', title: hi ? 'पत्र लिखें' : 'Write a letter', subtitle: hi ? 'शिकायत, आरटीआई, उत्तर' : 'Grievance, RTI, reply to notice', href: '/drafts' },
    { icon: 'newspaper-outline', title: hi ? 'क्या बदला' : 'What changed', subtitle: hi ? 'नए नियम' : 'New rules', href: '/updates' },
  ];
  const officialActions: Action[] = [
    { icon: 'flash-outline', title: hi ? 'मौके पर सहायक' : 'On-the-spot assistant', subtitle: hi ? 'धारा, दंड, प्रक्रिया तुरंत' : 'Sections, penalty, procedure now', href: '/spot' },
    { icon: 'create-outline', title: hi ? 'मसौदे' : 'Drafts', subtitle: hi ? 'मेमो, पावती, रिपोर्ट, उत्तर' : 'Memos, acknowledgements, reports', href: '/drafts' },
    { icon: 'clipboard-outline', title: t('checklists'), subtitle: hi ? 'फिटनेस, ड्राइविंग टेस्ट, जाँच' : 'Fitness, driving test, roadside', href: '/tools' },
    { icon: 'scan-outline', title: hi ? 'दस्तावेज़ स्कैन' : 'Scan a document', subtitle: hi ? 'शिकायत, नोटिस, चालान' : 'Complaints, notices, challans', href: '/scan' },
    { icon: 'newspaper-outline', title: hi ? 'क्या बदला' : 'What changed', subtitle: hi ? 'नए नियम और अधिसूचनाएँ' : 'New rules and notifications', href: '/updates' },
    { icon: 'calculator-outline', title: t('fineCalculator'), subtitle: hi ? 'धारा अनुसार दंड' : 'Penalty by section', href: '/fines' },
  ];
  const actions = official ? officialActions : citizenActions;

  const featuredIds = official
    ? ['mva-206', 'mva-207', 'dl-old-vehicles', 'mva-210b', 'mva-136a']
    : ['enf-echallan', 'mva-129', 'dl-old-vehicles', 'mva-134a', 'mva-130'];
  const code = stateCode(profile);
  const featured = featuredIds
    .map((id) => LAWS.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => !!l && (!l.jurisdiction || l.jurisdiction === 'central' || l.jurisdiction === code));

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
              : 'e.g. “Which sections apply to a taxi running without a permit in Delhi?”'
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
