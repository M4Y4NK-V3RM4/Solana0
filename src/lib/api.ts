import type { Profile } from './profile';
import type { ScanResult } from '../server/schemas';

export type { ScanResult };

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Base URL of the RoadNyay server. Empty means same origin (web) or the dev
 * server (native in development). Native and desktop release builds set
 * EXPO_PUBLIC_API_URL to the deployed server.
 */
const BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

type Ctx = Pick<Profile, 'role' | 'officialType' | 'state' | 'language'>;

function ctx(p: Profile | null): Ctx {
  return {
    role: p?.role ?? 'citizen',
    officialType: p?.officialType,
    state: p?.state ?? '',
    language: p?.language ?? 'en',
  };
}

export function askAI(messages: ChatMessage[], profile: Profile | null) {
  return post<{ reply: string }>('/api/ask', { messages, profile: ctx(profile) });
}

export function scanDocument(image: { base64: string; mediaType: string }, note: string, profile: Profile | null) {
  return post<{ result: ScanResult }>('/api/scan', { image, note, profile: ctx(profile) });
}
