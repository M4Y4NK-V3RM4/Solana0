import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, Chip, Field, H2, Row } from './ui';
import { translate } from '@/lib/i18n';
import { OFFICIAL_TYPES, STATES, useProfile, type Language, type OfficialType, type Role } from '@/lib/profile';
import { radius, space, useTheme } from '@/lib/theme';

function RoleCard({ selected, icon, title, hint, onPress }: { selected: boolean; icon: 'person-outline' | 'shield-checkmark-outline'; title: string; hint: string; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={{
        flexBasis: 240,
        flexGrow: 1,
        padding: space.lg,
        borderRadius: radius.lg,
        borderWidth: 2,
        borderColor: selected ? c.accent : c.border,
        backgroundColor: selected ? c.accentSoft : c.card,
        gap: space.sm,
      }}
    >
      <Ionicons name={icon} size={30} color={selected ? c.accent : c.muted} />
      <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{title}</Text>
      <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19 }}>{hint}</Text>
    </Pressable>
  );
}

/**
 * Sign-up: the user picks a role (citizen or official), their state and language.
 * The profile is stored on the device; it can be changed later in Settings.
 */
export function ProfileForm({ submitLabel, onDone }: { submitLabel?: string; onDone: () => void }) {
  const c = useTheme();
  const { profile, save } = useProfile();
  const [language, setLanguage] = useState<Language>(profile?.language ?? 'en');
  const [role, setRole] = useState<Role | null>(profile?.role ?? null);
  const [officialType, setOfficialType] = useState<OfficialType>(profile?.officialType ?? 'mvi');
  const [name, setName] = useState(profile?.name ?? '');
  const [state, setState] = useState(profile?.state ?? '');
  const [stateQuery, setStateQuery] = useState('');
  const t = (k: Parameters<typeof translate>[1]) => translate(language, k);

  const states = STATES.filter((s) => s.toLowerCase().includes(stateQuery.toLowerCase()));

  return (
    <View style={{ gap: space.xl }}>
      <View style={{ gap: space.sm }}>
        <H2>{t('language')}</H2>
        <Row>
          <Chip label="English" active={language === 'en'} onPress={() => setLanguage('en')} />
          <Chip label="हिन्दी" active={language === 'hi'} onPress={() => setLanguage('hi')} />
        </Row>
      </View>

      <View style={{ gap: space.sm }}>
        <H2>{t('whoAreYou')}</H2>
        <Body muted>{t('whoAreYouHint')}</Body>
        <Row wrap gap={space.md} style={{ alignItems: 'stretch' }}>
          <RoleCard selected={role === 'citizen'} icon="person-outline" title={t('citizen')} hint={t('citizenHint')} onPress={() => setRole('citizen')} />
          <RoleCard selected={role === 'official'} icon="shield-checkmark-outline" title={t('official')} hint={t('officialHint')} onPress={() => setRole('official')} />
        </Row>
        {role === 'official' ? (
          <Row wrap>
            {OFFICIAL_TYPES.map((o) => (
              <Chip key={o.id} label={language === 'hi' ? o.labelHi : o.label} active={officialType === o.id} onPress={() => setOfficialType(o.id)} />
            ))}
          </Row>
        ) : null}
      </View>

      <Field label={t('yourName')} value={name} onChangeText={setName} autoComplete="name" />

      <View style={{ gap: space.sm }}>
        <H2>{t('yourState')}</H2>
        {state ? <Body>✓ {state}</Body> : null}
        <Field placeholder="Search…" value={stateQuery} onChangeText={setStateQuery} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {states.map((s) => (
            <Chip key={s} label={s} active={state === s} onPress={() => setState(s)} />
          ))}
        </View>
      </View>

      <Button
        label={submitLabel ?? t('continue')}
        icon="arrow-forward"
        disabled={!role}
        onPress={async () => {
          if (!role) return;
          await save({ name: name.trim(), role, officialType: role === 'official' ? officialType : undefined, state, language });
          onDone();
        }}
      />
      {!role ? <Text style={{ color: c.muted, fontSize: 12, textAlign: 'center' }}>{t('chooseRole')}</Text> : null}
    </View>
  );
}

