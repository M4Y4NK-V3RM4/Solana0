import { spotCheck } from '@/server/claude';
import { handle } from '@/server/route';
import { SpotRequestSchema } from '@/server/schemas';

export function POST(request: Request) {
  return handle(request, SpotRequestSchema, spotCheck, (result) => ({ result }));
}
