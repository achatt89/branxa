import { randomUUID } from 'node:crypto';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Command } from 'commander';

import { tryAutoExtract, type AutoExtractResult } from '../lib/auto-extract';
import { loadConfig } from '../lib/config';
import { appendBranchEntry, assertInitialized, saveSessionEntry } from '../lib/context-store';
import { parseMultiValue } from '../lib/context-utils';
import {
  getChangedFiles,
  getCurrentBranch,
  getGitAuthor,
  getRecentCommits,
  getRepoName,
  getStagedFiles,
  isGitRepository
} from '../lib/git';
import type { ContextEntry } from '../types';

export interface SaveCommandOptions {
  goal?: string;
  auto?: boolean;
  approaches?: string;
  decisions?: string;
  state?: string;
  nextSteps?: string;
  blockers?: string;
}

export interface SaveDependencies {
  now?: () => Date;
  autoExtract?: (cwd: string) => Promise<AutoExtractResult | null>;
  prompt?: (question: string) => Promise<string>;
}

export interface SaveResult {
  ok: boolean;
  message: string;
  warnings: string[];
  entry?: ContextEntry;
}

export async function runSave(
  cwd: string,
  message: string | undefined,
  options: SaveCommandOptions,
  deps: SaveDependencies = {}
): Promise<SaveResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      message: 'Branxa save requires a git repository.',
      warnings: []
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      message: initialized.message,
      warnings: []
    };
  }

  const warnings: string[] = [];
  const config = await loadConfig(cwd);
  const now = deps.now ?? (() => new Date());

  let extracted: AutoExtractResult | null = null;
  if (options.auto) {
    try {
      extracted = await (deps.autoExtract ?? tryAutoExtract)(cwd);
      if (!extracted) {
        warnings.push('Auto extraction found no usable context; falling back to manual values.');
      }
    } catch {
      warnings.push('Auto extraction failed; falling back to manual values.');
    }
  }

  const approaches = parseMultiValue(options.approaches);
  const decisions = parseMultiValue(options.decisions);
  const nextSteps = parseMultiValue(options.nextSteps);
  const blockers = parseMultiValue(options.blockers);

  const draft = {
    task: message?.trim() || extracted?.task?.trim() || '',
    goal: options.goal?.trim() || extracted?.goal?.trim() || '',
    approaches: approaches.length > 0 ? approaches : extracted?.approaches ?? [],
    decisions: decisions.length > 0 ? decisions : extracted?.decisions ?? [],
    currentState: options.state?.trim() || extracted?.currentState?.trim() || '',
    nextSteps: nextSteps.length > 0 ? nextSteps : extracted?.nextSteps ?? [],
    blockers: blockers.length > 0 ? blockers : extracted?.blockers ?? []
  };

  const defaultPromptSession = deps.prompt ? null : createPromptIfPossible();
  const prompt = deps.prompt ?? defaultPromptSession?.ask ?? null;

  try {
    if (!draft.task) {
      draft.task = await askIfPossible(prompt, 'Task: ', 'Context update');
    }

    if (!draft.currentState) {
      draft.currentState = await askIfPossible(prompt, 'Current state: ', '(not specified)');
    }

    if (!draft.goal) {
      draft.goal = await askIfPossible(prompt, 'Goal (optional): ', '');
    }

    if (draft.nextSteps.length === 0) {
      const nextStepsResponse = await askIfPossible(prompt, 'Next steps (;; separated, optional): ', '');
      draft.nextSteps = parseMultiValue(nextStepsResponse);
    }

    if (draft.blockers.length === 0) {
      const blockersResponse = await askIfPossible(prompt, 'Blockers (;; separated, optional): ', '');
      draft.blockers = parseMultiValue(blockersResponse);
    }
  } finally {
    defaultPromptSession?.close();
  }

  const branch = getCurrentBranch(cwd);

  const filesChanged = config.autoGitCapture ? getChangedFiles(cwd) : [];
  const filesStaged = config.autoGitCapture ? getStagedFiles(cwd) : [];
  const recentCommits = config.autoGitCapture ? getRecentCommits(cwd, config.recentCommitCount) : [];

  const entry: ContextEntry = {
    id: randomUUID(),
    timestamp: now().toISOString(),
    branch,
    repo: getRepoName(cwd),
    author: getGitAuthor(cwd),
    task: draft.task,
    goal: draft.goal,
    approaches: draft.approaches,
    decisions: draft.decisions,
    currentState: draft.currentState,
    nextSteps: draft.nextSteps,
    blockers: draft.blockers,
    filesChanged,
    filesStaged,
    recentCommits
  };

  await appendBranchEntry(cwd, entry);
  await saveSessionEntry(cwd, entry);

  return {
    ok: true,
    message: `Saved context for branch '${branch}'.`,
    warnings,
    entry
  };
}

export function createSaveCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('save')
    .description('Save coding context')
    .argument('[message]')
    .option('--goal <value>')
    .option('--auto')
    .option('--approaches <value>')
    .option('--decisions <value>')
    .option('--state <value>')
    .option('--next-steps <value>')
    .option('--blockers <value>')
    .action(async (message: string | undefined, options: SaveCommandOptions) => {
      const result = await runSave(resolveCwd(), message, options);

      if (!result.ok) {
        console.error(result.message);
        process.exitCode = 1;
        return;
      }

      for (const warning of result.warnings) {
        console.warn(warning);
      }

      console.log(result.message);
    });
}

interface PromptSession {
  ask: (question: string) => Promise<string>;
  close: () => void;
}

function createPromptIfPossible(): PromptSession | null {
  if (!process.stdin.isTTY) {
    return null;
  }

  const rl = readline.createInterface({ input, output });

  return {
    ask: async (question: string): Promise<string> => {
      const answer = await rl.question(question);
      return answer.trim();
    },
    close: () => {
      rl.close();
    }
  };
}

async function askIfPossible(
  prompt: ((question: string) => Promise<string>) | null,
  question: string,
  fallback: string
): Promise<string> {
  if (!prompt) {
    return fallback;
  }

  const value = await prompt(question);
  return value || fallback;
}
