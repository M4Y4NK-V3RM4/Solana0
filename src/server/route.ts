import type { z } from 'zod';
import { errorResponse, isConfigured } from './claude';

/** Shared handler for the AI routes: config check, validation, error mapping. */
export async function handle<S extends z.ZodType, R>(request: Request, schema: S, run: (input: z.infer<S>) => Promise<R>, wrap: (r: R) => object) {
  if (!isConfigured()) return Response.json({ error: 'The AI service is not configured on this server.' }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid request.' }, { status: 400 });
  try {
    return Response.json(wrap(await run(parsed.data)));
  } catch (err) {
    return errorResponse(err);
  }
}
