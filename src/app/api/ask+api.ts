import { answerQuestion } from '@/server/claude';
import { handle } from '@/server/route';
import { AskRequestSchema } from '@/server/schemas';

export function POST(request: Request) {
  return handle(request, AskRequestSchema, answerQuestion, (reply) => ({ reply }));
}
