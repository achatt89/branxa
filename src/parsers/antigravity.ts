import {
  collectBulletItems,
  extractTaggedValue,
  extractTaggedValues,
  mergeContext,
  normalizeContext,
  pickFirstNonEmptyLine,
  readTextIfExists
} from './shared';
import type { ExtractedContext } from './types';

const ROOT_CANDIDATES = ['.antigravity', 'antigravity'];

export async function extractAntigravityContext(cwd: string): Promise<ExtractedContext | null> {
  let merged: ExtractedContext | null = null;

  for (const root of ROOT_CANDIDATES) {
    const task = await readTextIfExists(cwd, `${root}/task.md`);
    const implementationPlan = await readTextIfExists(cwd, `${root}/implementation_plan.md`);
    const walkthrough = await readTextIfExists(cwd, `${root}/walkthrough.md`);

    if (!task && !implementationPlan && !walkthrough) {
      continue;
    }

    const taskContext: ExtractedContext | null = task
      ? normalizeContext({
          task: extractTaggedValue(task, 'task') || pickFirstNonEmptyLine(task),
          goal: extractTaggedValue(task, 'goal')
        })
      : null;

    const implementationContext: ExtractedContext | null = implementationPlan
      ? normalizeContext({
          approaches: [...extractTaggedValues(implementationPlan, 'approach'), ...collectBulletItems(implementationPlan)],
          decisions: extractTaggedValues(implementationPlan, 'decision'),
          nextSteps: extractTaggedValues(implementationPlan, 'next step')
        })
      : null;

    const walkthroughContext: ExtractedContext | null = walkthrough
      ? normalizeContext({
          currentState: extractTaggedValue(walkthrough, 'current state') || pickFirstNonEmptyLine(walkthrough),
          blockers: extractTaggedValues(walkthrough, 'blocker')
        })
      : null;

    const rootContext = mergeContext(mergeContext(taskContext, implementationContext), walkthroughContext);
    merged = mergeContext(merged, rootContext);
  }

  return merged;
}
