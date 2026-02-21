import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface AutoExtractResult {
  task?: string;
  goal?: string;
  approaches?: string[];
  decisions?: string[];
  currentState?: string;
  nextSteps?: string[];
  blockers?: string[];
}

const CLAUDE_MEMORY_PATH = '.claude/branxa-memory.json';

export async function tryAutoExtract(cwd: string): Promise<AutoExtractResult | null> {
  const claudeMemory = path.join(cwd, CLAUDE_MEMORY_PATH);

  try {
    const raw = await fs.readFile(claudeMemory, 'utf8');
    const parsed = JSON.parse(raw) as AutoExtractResult;
    return parsed;
  } catch {
    return null;
  }
}
