import { analyseDocument } from '@/server/claude';
import { handle } from '@/server/route';
import { ScanRequestSchema } from '@/server/schemas';

export function POST(request: Request) {
  return handle(request, ScanRequestSchema, analyseDocument, (result) => ({ result }));
}
