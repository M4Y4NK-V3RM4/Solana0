import { z } from 'zod';

/**
 * The format the data-collection assistants return (one JSON object per line).
 * Keep in sync with docs/data-collection-prompt.md.
 */
export const RECORD_TYPES = [
  'act_section', 'rule', 'regulation', 'scheme', 'notification', 'circular', 'fine', 'procedure', 'form', 'fee',
  'judgment', 'committee_report', 'history_event', 'test_question', 'road_sign', 'glossary',
] as const;

const nullableDate = z
  .string()
  .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'use YYYY-MM-DD')
  .nullable()
  .optional()
  .transform((v) => v ?? null);

export const SourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional().default(''),
  publisher: z.string().optional().default(''),
  date_published: z.string().optional().default(''),
  date_accessed: z.string().optional().default(''),
});

export const FineSchema = z.object({
  offence: z.string().optional().default(''),
  first: z.string().optional().default(''),
  subsequent: z.string().optional().default(''),
  min_rs: z.number().nonnegative().optional().default(0),
  max_rs: z.number().nonnegative().optional().default(0),
  other_consequences: z.string().optional().default(''),
});

export const RecordSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9._-]*$/, 'lowercase letters, digits, dots, dashes'),
  type: z.enum(RECORD_TYPES),
  jurisdiction: z.string().min(2).transform((j) => (j.toLowerCase() === 'central' ? 'central' : j.toUpperCase())),
  instrument: z.string().optional().default(''),
  reference: z.string().optional().default(''),
  title: z.string().min(1),
  text: z.string().optional().default(''),
  summary_en: z.string().optional().default(''),
  history: z.string().optional().default(''),
  fine: FineSchema.nullable().optional().transform((v) => v ?? null),
  effective_from: nullableDate,
  effective_to: nullableDate,
  status: z.enum(['in_force', 'amended', 'repealed', 'stayed', 'not_notified', 'unknown']).optional().default('unknown'),
  supersedes: z.array(z.string()).optional().default([]),
  amended_by: z.array(z.string()).optional().default([]),
  related: z.array(z.string()).optional().default([]),
  audience: z.enum(['citizen', 'official', 'both']).optional().default('both'),
  tags: z.array(z.string()).optional().default([]),
  sources: z.array(SourceSchema).min(1, 'every record needs at least one source'),
  verified: z.boolean().optional().default(false),
  conflict: z.boolean().optional().default(false),
  notes: z.string().optional().default(''),
});

export type DataRecord = z.infer<typeof RecordSchema>;
