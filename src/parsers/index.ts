import { extractAntigravityContext } from './antigravity';
import { extractClaudeContext } from './claude';
import { extractCursorContext } from './cursor';
import { mergeContext } from './shared';
import type { ExtractedContext } from './types';

export async function extractAutoContext(cwd: string): Promise<ExtractedContext | null> {
  const claude = await extractClaudeContext(cwd);
  if (hasMeaningfulContext(claude)) {
    return claude;
  }

  const antigravity = await extractAntigravityContext(cwd);
  if (hasMeaningfulContext(antigravity)) {
    return antigravity;
  }

  const cursor = await extractCursorContext(cwd);
  return mergeContext(null, cursor);
}

function hasMeaningfulContext(context: ExtractedContext | null): boolean {
  if (!context) {
    return false;
  }

  return Boolean(
    context.task ||
      context.goal ||
      (context.approaches && context.approaches.length > 0) ||
      (context.decisions && context.decisions.length > 0) ||
      context.currentState ||
      (context.nextSteps && context.nextSteps.length > 0) ||
      (context.blockers && context.blockers.length > 0)
  );
}
