import { extractJsonValue } from '../lib/ai';
import { toStringArray } from '../lib/arrays';

import {
  extractTaggedValue,
  extractTaggedValues,
  mergeContext,
  normalizeContext,
  pickFirstNonEmptyLine,
  readTextIfExists
} from './shared';
import type { ExtractedContext } from './types';

const MEMORY_CANDIDATES = ['.claude/branxa-memory.json', '.claude/memory.json'];
const JSONL_CANDIDATES = ['.claude/session.jsonl', '.claude/sessions/latest.jsonl'];

export async function extractClaudeContext(cwd: string): Promise<ExtractedContext | null> {
  const memoryContext = await extractFromMemory(cwd);
  const jsonlContext = await extractFromJsonl(cwd);

  return mergeContext(memoryContext, jsonlContext);
}

async function extractFromMemory(cwd: string): Promise<ExtractedContext | null> {
  for (const candidate of MEMORY_CANDIDATES) {
    const raw = await readTextIfExists(cwd, candidate);
    if (!raw) {
      continue;
    }

    const parsed = extractJsonValue(raw);
    if (!parsed || typeof parsed !== 'object') {
      continue;
    }

    const record = parsed as Record<string, unknown>;

    return normalizeContext({
      task: asString(record.task),
      goal: asString(record.goal),
      approaches: toStringArray(record.approaches),
      decisions: toStringArray(record.decisions),
      currentState: asString(record.currentState) || asString(record.state),
      nextSteps: toStringArray(record.nextSteps),
      blockers: toStringArray(record.blockers)
    });
  }

  return null;
}

async function extractFromJsonl(cwd: string): Promise<ExtractedContext | null> {
  for (const candidate of JSONL_CANDIDATES) {
    const raw = await readTextIfExists(cwd, candidate);
    if (!raw) {
      continue;
    }

    const context = parseClaudeJsonl(raw);
    if (context) {
      return context;
    }
  }

  return null;
}

function parseClaudeJsonl(raw: string): ExtractedContext | null {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const contentParts: string[] = [];

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as Record<string, unknown>;
      const content =
        asString(parsed.content) || asString(parsed.text) || asString((parsed.message as Record<string, unknown> | undefined)?.content);

      if (content) {
        contentParts.push(content);
      }
    } catch {
      contentParts.push(line);
    }
  }

  if (contentParts.length === 0) {
    return null;
  }

  const merged = contentParts.join('\n');
  const task = extractTaggedValue(merged, 'task') || pickFirstNonEmptyLine(merged);
  const approaches = extractTaggedValues(merged, 'approach');
  const decisions = extractTaggedValues(merged, 'decision');
  const currentState = extractTaggedValue(merged, 'state') || extractTaggedValue(merged, 'current state');

  const context = normalizeContext({
    task,
    approaches,
    decisions,
    currentState
  });

  if (!context.task && (context.approaches ?? []).length === 0 && (context.decisions ?? []).length === 0 && !context.currentState) {
    return null;
  }

  return context;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
