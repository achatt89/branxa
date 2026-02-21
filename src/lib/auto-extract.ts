import { extractAutoContext } from '../parsers';
import type { ExtractedContext } from '../parsers/types';

export type AutoExtractResult = ExtractedContext;

export async function tryAutoExtract(cwd: string): Promise<AutoExtractResult | null> {
  return extractAutoContext(cwd);
}
