import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type { z } from 'zod';
import { DRAFT_TEMPLATES } from '../data/templates';
import { STATE_CODES } from '../lib/profile-constants';
import { knowledgeFor } from './knowledge';
import {
  DraftResultSchema,
  ScanResultSchema,
  SpotResultSchema,
  type AskRequest,
  type DraftRequest,
  type DraftResult,
  type ScanRequest,
  type ScanResult,
  type SpotRequest,
  type SpotResult,
} from './schemas';

// Fast, low-cost model. Override with ROADNYAY_MODEL on the server if needed.
const MODEL = process.env.ROADNYAY_MODEL || 'claude-haiku-5-5';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  return (client ??= new Anthropic());
}

type Profile = AskRequest['profile'];

const BASE_INSTRUCTIONS = `You are RoadNyay, an assistant for Indian road transport and traffic law. Your main users are transport and traffic officials (Motor Vehicles Inspectors, traffic police, RTO and transport department staff); citizens use it too. The launch region is Delhi.

How to answer:
- Ground every legal statement in the knowledge base below. Cite provisions like "MV Act s.194D" or "CMVR Rule 139" and include the knowledge id in square brackets, e.g. [off-194d], so the app can link to it.
- Records tagged {DL} (or another state code) are specific to that state; untagged records are central law. Prefer the user's state record over the central one when both exist.
- If the knowledge base does not cover something, you may use general knowledge of Indian law, but say clearly that it is not in the RoadNyay library and must be verified on India Code, the state transport department or traffic police website, or with a lawyer. Never invent section numbers, amounts, notification numbers or case names.
- Untagged fine amounts are central penalties. States can compound at different amounts (s.200) and apply multipliers (s.210A). Say so whenever you quote a central fine.
- Be practical: steps, deadlines, documents, and official portals (Parivahan e-Challan, Sarathi, Vahan). Warn about fake challan payment links when relevant.
- Officials get procedural detail: powers, sections to cite, what to record and hand over. The officer makes the decision; you advise. Citizens get plain language and their rights.
- This is legal information, not legal advice. For serious matters (injury accidents, drunk driving, court cases) recommend a lawyer or legal aid (NALSA / District Legal Services Authority).`;

function system(query: string, profile: Profile): Anthropic.TextBlockParam[] {
  const kb = knowledgeFor(query, STATE_CODES[profile.state]);
  const kbBlock = `KNOWLEDGE BASE${kb.complete ? '' : ' (the records most relevant to this request; the full library is larger)'}\n==============\n${kb.text}`;
  // Stable content first so it is cached across users and requests. When the
  // whole library is sent it is identical every time, so it is cached too.
  return [
    { type: 'text', text: BASE_INSTRUCTIONS, ...(kb.complete ? {} : { cache_control: { type: 'ephemeral' as const } }) },
    { type: 'text', text: kbBlock, ...(kb.complete ? { cache_control: { type: 'ephemeral' as const, ttl: '1h' as const } } : {}) },
  ];
}

function audienceNote(p: Profile): string {
  const who =
    p.role === 'official'
      ? `an official (${{ mvi: 'Motor Vehicles Inspector', police: 'traffic police officer', rto: 'RTO / transport office staff', other: 'transport official' }[p.officialType ?? 'other']})`
      : 'a citizen';
  const lang = p.language === 'hi' ? 'Write in Hindi (Devanagari), keeping section numbers and official names in English.' : 'Write in English.';
  return `The user is ${who}${p.state ? ` in ${p.state}` : ''}. ${lang}`;
}

export class RefusedError extends Error {}

function imageBlock(image?: { base64: string; mediaType: string }): Anthropic.ImageBlockParam[] {
  if (!image) return [];
  return [{ type: 'image', source: { type: 'base64', media_type: image.mediaType as 'image/jpeg', data: image.base64 } }];
}

async function structured<S extends z.ZodType>(schema: S, query: string, profile: Profile, content: Anthropic.ContentBlockParam[]): Promise<z.infer<S>> {
  const response = await getClient().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: system(query, profile),
    output_config: { effort: 'medium', format: zodOutputFormat(schema) },
    messages: [{ role: 'user', content }],
  });
  if (response.stop_reason === 'refusal') throw new RefusedError('The request was declined.');
  if (!response.parsed_output) throw new Error('Could not read a structured answer from the AI.');
  return response.parsed_output as z.infer<S>;
}

export async function answerQuestion(req: AskRequest): Promise<string> {
  const messages: Anthropic.MessageParam[] = req.messages.map((m) => ({ role: m.role, content: m.content }));
  // Per-user context goes after the history as an operator message, keeping the cached prefix intact.
  messages.push({ role: 'system', content: audienceNote(req.profile) });
  const query = req.messages.filter((m) => m.role === 'user').slice(-3).map((m) => m.content).join(' ');

  const response = await getClient()
    .messages.stream({ model: MODEL, max_tokens: 16000, system: system(query, req.profile), output_config: { effort: 'medium' }, messages })
    .finalMessage();
  if (response.stop_reason === 'refusal') throw new RefusedError('The request was declined.');
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

export function analyseDocument(req: ScanRequest): Promise<ScanResult> {
  const instruction = `Read the attached image. It may be a traffic e-challan, a court summons or notice, an RTO letter, a complaint, an accident photo, or something else. ${audienceNote(req.profile)}
Extract what it says, identify the provisions involved using the knowledge base, explain the legal consequences and process, the person's options, and any deadlines. If parts are unreadable, say so in warnings rather than guessing. If it looks like a fake or phishing challan (unofficial payment link, odd sender, mismatched details), say so in warnings.${req.note ? `\nThe user adds: ${req.note}` : ''}`;
  return structured(ScanResultSchema, `challan notice letter ${req.note}`, req.profile, [...imageBlock(req.image), { type: 'text', text: instruction }]);
}

export function spotCheck(req: SpotRequest): Promise<SpotResult> {
  const instruction = `${audienceNote(req.profile)} The official is dealing with this situation right now${req.image ? ' (photo attached)' : ''}:
"""${req.description || '(see photo)'}"""
Identify every offence that applies and to whom, the penalty from the knowledge base, whether the licence can be seized, what to check, the procedure in order, what to give the driver or owner, what evidence to record, and cautions. Only list offences supported by the facts; if a fact needed to decide is missing, say so in cautions. Keep each item short — this is read on a phone at the roadside.`;
  return structured(SpotResultSchema, req.description, req.profile, [...imageBlock(req.image), { type: 'text', text: instruction }]);
}

export function writeDraft(req: DraftRequest): Promise<DraftResult> {
  const template = DRAFT_TEMPLATES.find((t) => t.id === req.templateId);
  if (!template) throw new BadInputError('Unknown template.');
  const instruction = `${audienceNote(req.profile)}
Write a draft: ${template.title}.
What it must contain: ${template.guidance}
Details from the user${req.image ? ' (and the attached document)' : ''}:
"""${req.details || '(none given)'}"""
Rules: use only facts given by the user or shown in the attached document. Put every missing name, number, date, address and finding as a [PLACEHOLDER] in square brackets — never invent them. Cite only provisions from the knowledge base or that the user supplied, written out in full (e.g. "Section 129 of the Motor Vehicles Act, 1988") — do not include knowledge-base ids in square brackets, since square brackets mark placeholders. Start the body with the line "DRAFT — review before use". Plain text, no markdown.`;
  return structured(DraftResultSchema, `${template.title} ${req.details}`, req.profile, [...imageBlock(req.image), { type: 'text', text: instruction }]);
}

export class BadInputError extends Error {}

export function errorResponse(err: unknown): Response {
  if (err instanceof BadInputError) return Response.json({ error: err.message }, { status: 400 });
  if (err instanceof RefusedError) return Response.json({ error: 'The AI declined to answer this request.' }, { status: 422 });
  if (err instanceof Anthropic.AuthenticationError) return Response.json({ error: 'The AI service is not configured (invalid API key).' }, { status: 503 });
  if (err instanceof Anthropic.RateLimitError) return Response.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429 });
  if (err instanceof Anthropic.BadRequestError) return Response.json({ error: 'The AI could not process this request.' }, { status: 400 });
  if (err instanceof Anthropic.APIError) return Response.json({ error: 'The AI service is temporarily unavailable.' }, { status: 502 });
  console.error(err);
  return Response.json({ error: 'Something went wrong.' }, { status: 500 });
}

export function isConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}
