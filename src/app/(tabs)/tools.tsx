import { router } from 'expo-router';
import { View } from 'react-native';
import { Body, Card, H2, Screen, Tile, type IconName } from '@/components/ui';
import { CHECKLISTS } from '@/data/checklists';
import { useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { space } from '@/lib/theme';

export default function Tools() {
  const { t, lang } = useT();
  const { profile } = useProfile();
  const hi = lang === 'hi';
  const official = profile?.role === 'official';

  const work: { icon: IconName; title: string; subtitle: string; href: string }[] = [
    { icon: 'flash-outline', title: hi ? 'मौके पर सहायक' : 'On-the-spot assistant', subtitle: hi ? 'स्थिति बताइए, धाराएँ पाइए' : 'Describe it, get sections and steps', href: '/spot' },
    { icon: 'create-outline', title: hi ? 'मसौदे' : 'Drafts', subtitle: hi ? 'मेमो, पावती, रिपोर्ट, उत्तर' : 'Memos, acknowledgements, reports, replies', href: '/drafts' },
    { icon: 'newspaper-outline', title: hi ? 'क्या बदला' : 'What changed', subtitle: hi ? 'नए नियम और अधिसूचनाएँ' : 'New rules and notifications', href: '/updates' },
    { icon: 'ribbon-outline', title: hi ? 'परीक्षा अभ्यास' : 'Exam practice', subtitle: hi ? 'एमवीआई / एएमवीआई / विभागीय' : 'MVI / AMVI / departmental', href: '/quiz?set=official' },
  ];
  const tile = (a: (typeof work)[number]) => <Tile key={a.title} icon={a.icon} title={a.title} subtitle={a.subtitle} onPress={() => router.push(a.href as never)} />;

  const learn: { icon: IconName; title: string; subtitle: string; href: string }[] = [
    { icon: 'school-outline', title: t('practiceTest'), subtitle: hi ? 'लर्नर टेस्ट शैली के 30 प्रश्न' : '30 learner-test style questions', href: '/quiz' },
    { icon: 'warning-outline', title: t('roadSigns'), subtitle: hi ? 'अनिवार्य, चेतावनी, सूचना' : 'Mandatory, cautionary, informatory', href: '/signs' },
    { icon: 'calculator-outline', title: t('fineCalculator'), subtitle: hi ? 'धारा अनुसार जुर्माना' : 'Penalty by section', href: '/fines' },
    { icon: 'time-outline', title: t('timeline'), subtitle: hi ? '1914 से आज तक' : 'From 1914 to today', href: '/timeline' },
  ];

  const checklistSection = (
    <View style={{ gap: space.md }}>
      <H2>{t('checklists')}</H2>
      {CHECKLISTS.map((cl) => (
        <Card key={cl.id} onPress={() => router.push(`/checklist/${cl.id}`)}>
          <H2 style={{ fontSize: 16 }}>{cl.title}</H2>
          <Body muted>
            {cl.for} · {cl.basis}
          </Body>
        </Card>
      ))}
    </View>
  );

  return (
    <Screen>
      {official ? (
        <>
          <H2>{hi ? 'काम के टूल' : 'Work tools'}</H2>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>{work.map(tile)}</View>
          {checklistSection}
        </>
      ) : null}
      <H2>{official ? (hi ? 'संदर्भ' : 'Reference') : t('learn')}</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        {learn.map(tile)}
      </View>
      {!official ? (
        <>
          <H2>{hi ? 'पत्र और अधिकारी टूल' : 'Letters and official tools'}</H2>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>{[work[1], work[2]].map(tile)}</View>
          {checklistSection}
        </>
      ) : null}
    </Screen>
  );
}
