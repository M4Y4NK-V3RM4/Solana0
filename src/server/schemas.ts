import { z } from 'zod';

export const ScanResultSchema = z.object({
  isTrafficRelated: z.boolean().describe('False if the image is not a transport/traffic document or photo.'),
  documentType: z.string().describe('e.g. "Traffic e-challan", "Court summons", "RTO notice", "Accident photo", "Complaint letter".'),
  issuedBy: z.string().describe('Issuing authority if visible, else empty string.'),
  summary: z.string().describe('Two to four sentences in plain language: what this document is and what it is about.'),
  keyFacts: z.array(z.object({ label: z.string(), value: z.string() })).describe('Facts read from the document: challan no., vehicle no., date, place, amount, officer.'),
  sections: z
    .array(
      z.object({
        reference: z.string().describe('e.g. "MV Act s.194D" or "CMVR Rule 139".'),
        title: z.string(),
        explanation: z.string().describe('What this provision means for this person.'),
        knowledgeId: z.string().describe('Matching id from the knowledge base, or empty string if none.'),
      }),
    )
    .describe('Legal provisions involved, whether printed on the document or inferred.'),
  estimatedAmount: z.string().describe('Amount payable as written on the document, or the central penalty range if not written. Empty if not applicable.'),
  whatHappensNext: z.array(z.string()).describe('Legal consequences and process steps in order.'),
  options: z.array(z.string()).describe('What the person can do: pay, contest, appeal, produce documents, etc.'),
  deadlines: z.array(z.string()).describe('Time limits that apply. Empty if none.'),
  warnings: z.array(z.string()).describe('Things to be careful about, e.g. signs the challan may be fake, unreadable parts, state variations.'),
  confidence: z.enum(['high', 'medium', 'low']).describe('How confident the reading and legal analysis are.'),
});

export type ScanResult = z.infer<typeof ScanResultSchema>;

const ProfileSchema = z.object({
  role: z.enum(['citizen', 'official']),
  officialType: z.enum(['mvi', 'police', 'rto', 'other']).optional(),
  state: z.string().max(80),
  language: z.enum(['en', 'hi']),
});

export const AskRequestSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(8000) }))
    .min(1)
    .max(40),
  profile: ProfileSchema,
});

export const ScanRequestSchema = z.object({
  image: z.object({
    base64: z.string().min(100).max(8_000_000),
    mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  }),
  note: z.string().max(2000).default(''),
  profile: ProfileSchema,
});

export type AskRequest = z.infer<typeof AskRequestSchema>;
export type ScanRequest = z.infer<typeof ScanRequestSchema>;
