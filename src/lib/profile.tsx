import AsyncStorage from '@react-native-async-storage/async-storage';
import { STATE_CODES } from './profile-constants';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Role = 'citizen' | 'official';
export type OfficialType = 'mvi' | 'police' | 'rto' | 'other';
export type Language = 'en' | 'hi';

export interface Profile {
  name: string;
  role: Role;
  officialType?: OfficialType;
  state: string;
  language: Language;
}

const KEY = 'roadnyay.profile.v1';

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  save: (p: Profile) => Promise<void>;
  reset: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setProfile(JSON.parse(raw) as Profile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (p: Profile) => {
    setProfile(p);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      // Storage can be unavailable (private browsing); the session still works.
    }
  }, []);

  const reset = useCallback(async () => {
    setProfile(null);
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {}
  }, []);

  const value = useMemo(() => ({ profile, loading, save, reset }), [profile, loading, save, reset]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}

export { LAUNCH_STATE, OFFICIAL_TYPES, STATE_CODES, STATES } from './profile-constants';
export function stateCode(profile: Pick<Profile, 'state'> | null | undefined): string | undefined {
  return profile?.state ? STATE_CODES[profile.state] : undefined;
}
