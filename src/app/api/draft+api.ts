import { writeDraft } from '@/server/claude';
import { handle } from '@/server/route';
import { DraftRequestSchema } from '@/server/schemas';

export function POST(request: Request) {
  return handle(request, DraftRequestSchema, writeDraft, (result) => ({ result }));
}
