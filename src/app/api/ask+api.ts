import { answerQuestion, errorResponse, isConfigured } from '@/server/claude';
import { AskRequestSchema } from '@/server/schemas';

export async function POST(request: Request) {
  if (!isConfigured()) return Response.json({ error: 'The AI service is not configured on this server.' }, { status: 503 });
  const parsed = AskRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid request.' }, { status: 400 });
  try {
    return Response.json({ reply: await answerQuestion(parsed.data) });
  } catch (err) {
    return errorResponse(err);
  }
}
