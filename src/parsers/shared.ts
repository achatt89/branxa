import { promises as fs } from 'node:fs';
import path from 'node:path';

import { uniqueValues } from '../lib/arrays';
import type { ExtractedContext } from './types';

export async function readTextIfExists(cwd: string, relativePath: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(cwd, relativePath), 'utf8');
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

export function mergeContext(base: ExtractedContext | null, next: ExtractedContext | null): ExtractedContext | null {
  if (!base && !next) {
    return null;
  }

  if (!base) {
    return normalizeContext(next as ExtractedContext);
  }

  if (!next) {
    return normalizeContext(base);
  }

  return normalizeContext({
    task: next.task || base.task,
    goal: next.goal || base.goal,
    approaches: [...(base.approaches ?? []), ...(next.approaches ?? [])],
    decisions: [...(base.decisions ?? []), ...(next.decisions ?? [])],
    currentState: next.currentState || base.currentState,
    nextSteps: [...(base.nextSteps ?? []), ...(next.nextSteps ?? [])],
    blockers: [...(base.blockers ?? []), ...(next.blockers ?? [])]
  });
}

export function normalizeContext(context: ExtractedContext): ExtractedContext {
  return {
    task: context.task?.trim(),
    goal: context.goal?.trim(),
    approaches: uniqueValues(context.approaches ?? []),
    decisions: uniqueValues(context.decisions ?? []),
    currentState: context.currentState?.trim(),
    nextSteps: uniqueValues(context.nextSteps ?? []),
    blockers: uniqueValues(context.blockers ?? [])
  };
}

export function pickFirstNonEmptyLine(text: string): string {
  const lines = text
    .split('\n')
    .map((line) => line.replace(/^#+\s*/, '').trim())
    .filter((line) => line.length > 0);

  return lines[0] ?? '';
}

export function collectBulletItems(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^([-*]|\d+\.)\s+/.test(line))
    .map((line) => line.replace(/^([-*]|\d+\.)\s+/, '').trim())
    .filter((line) => line.length > 0);
}

export function extractTaggedValues(text: string, tag: string): string[] {
  const lines = text.split('\n').map((line) => line.trim());
  const regex = new RegExp(`^${tag}\\s*:\\s*(.+)$`, 'i');

  return lines
    .map((line) => {
      const match = line.match(regex);
      return match?.[1]?.trim() ?? '';
    })
    .filter((value) => value.length > 0);
}

export function extractTaggedValue(text: string, tag: string): string {
  const values = extractTaggedValues(text, tag);
  return values[0] ?? '';
}
