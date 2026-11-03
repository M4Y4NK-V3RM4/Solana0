import { analyseDocument, errorResponse, isConfigured } from '@/server/claude';
import { ScanRequestSchema } from '@/server/schemas';

export async function POST(request: Request) {
  if (!isConfigured()) return Response.json({ error: 'The AI service is not configured on this server.' }, { status: 503 });
  const parsed = ScanRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid request. Send a JPEG, PNG or WebP image.' }, { status: 400 });
  try {
    return Response.json({ result: await analyseDocument(parsed.data) });
  } catch (err) {
    return errorResponse(err);
  }
}
