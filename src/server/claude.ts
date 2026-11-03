import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { knowledgeBase } from './knowledge';
import { ScanResultSchema, type AskRequest, type ScanRequest, type ScanResult } from './schemas';

const MODEL = 'claude-opus-5-5';
// Re-runs a request on Anthropic's recommended fallback model if the main model declines.
const BETAS: Anthropic.Beta.AnthropicBeta[] = ['server-side-fallback-2026-07-01'];

let client: Anthropic | null = null;
function getClient(): Anthropic {
  return (client ??= new Anthropic());
}

const BASE_INSTRUCTIONS = `You are RoadNyay, an assistant for Indian road transport and traffic law. Your users are citizens (drivers, learners, vehicle owners, people who received a challan or notice) and officials (Motor Vehicles Inspectors, traffic police, RTO and transport department staff).

How to answer:
- Ground every legal statement in the knowledge base below. Cite provisions like "MV Act s.194D" or "CMVR Rule 139" and include the knowledge id in square brackets, e.g. [off-194d], so the app can link to it.
- If the knowledge base does not cover something, you may use your general knowledge of Indian law, but say clearly that it is not in the RoadNyay library and should be verified on India Code, the state transport department website, or with a lawyer. Never invent section numbers, amounts or case names.
- Amounts in the knowledge base are central penalties. States can compound at different amounts (s.200) and apply multipliers (s.210A). Say so whenever you quote a fine.
- Be practical: what happens next, deadlines, documents needed, how to pay or contest, and where (official portals such as Parivahan e-Challan, Sarathi, Vahan).
- Warn about fake challan scams when relevant: pay only on official government portals.
- Officials should get procedural detail (powers, sections to cite, seizure and acknowledgement, checklists). Citizens should get plain language and their rights.
- This is legal information, not legal advice. For court cases or serious offences (accidents with injury, drunk driving), recommend consulting a lawyer or legal aid (NALSA / District Legal Services Authority).

KNOWLEDGE BASE
==============
`;

function system(): Anthropic.Beta.BetaTextBlockParam[] {
  // Stable prefix first so it is cached across every user and request.
  return [{ type: 'text', text: BASE_INSTRUCTIONS + knowledgeBase(), cache_control: { type: 'ephemeral', ttl: '1h' } }];
}

function audienceNote(p: AskRequest['profile']): string {
  const who =
    p.role === 'official'
      ? `an official (${{ mvi: 'Motor Vehicles Inspector', police: 'traffic police officer', rto: 'RTO / transport office staff', other: 'transport official' }[p.officialType ?? 'other']})`
      : 'a citizen';
  const lang = p.language === 'hi' ? 'Reply in Hindi (Devanagari), keeping section numbers and official names in English.' : 'Reply in English.';
  return `The user is ${who}${p.state ? ` in ${p.state}` : ''}. ${lang}`;
}

export class RefusedError extends Error {}

export async function answerQuestion(req: AskRequest): Promise<string> {
  const messages: Anthropic.Beta.BetaMessageParam[] = req.messages.map((m) => ({ role: m.role, content: m.content }));
  // Per-user context goes after the cached history as an operator message.
  messages.push({ role: 'system', content: audienceNote(req.profile) });

  const stream = getClient().beta.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    betas: BETAS,
    fallbacks: 'default',
    system: system(),
    output_config: { effort: 'medium' },
    messages,
  });
  const response = await stream.finalMessage();
  if (response.stop_reason === 'refusal') throw new RefusedError('The request was declined.');
  return response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

export async function analyseDocument(req: ScanRequest): Promise<ScanResult> {
  const instruction = `Read the attached image. It may be a traffic e-challan, a court summons or notice, an RTO letter, a complaint, an accident photo, or something else. ${audienceNote(req.profile)}
Extract what it says, identify the provisions involved using the knowledge base, explain the legal consequences and process, the person's options, and any deadlines. If parts are unreadable, say so in warnings rather than guessing. If it looks like a fake or phishing challan (unofficial payment link, odd sender, mismatched details), say so in warnings.${req.note ? `\nThe user adds: ${req.note}` : ''}`;

  const response = await getClient().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: BETAS,
    fallbacks: 'default',
    system: system(),
    output_config: { effort: 'medium', format: betaZodOutputFormat(ScanResultSchema) },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: req.image.mediaType, data: req.image.base64 } },
          { type: 'text', text: instruction },
        ],
      },
    ],
  });
  if (response.stop_reason === 'refusal') throw new RefusedError('The request was declined.');
  if (!response.parsed_output) throw new Error('Could not read a structured answer from the AI.');
  return response.parsed_output;
}

export function errorResponse(err: unknown): Response {
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
