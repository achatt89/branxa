import { randomUUID } from 'node:crypto';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Command } from 'commander';

import { loadConfig } from '../lib/config';
import { appendBranchEntry, assertInitialized, readBranchEntries, saveSessionEntry } from '../lib/context-store';
import { sortByTimestampAsc } from '../lib/context-utils';
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

export interface HandoffDependencies {
  prompt?: (question: string) => Promise<string>;
  now?: () => Date;
}

export interface HandoffResult {
  ok: boolean;
  message: string;
  entry?: ContextEntry;
}

export async function runHandoff(
  cwd: string,
  assigneeArg: string | undefined,
  noteArg: string | undefined,
  deps: HandoffDependencies = {}
): Promise<HandoffResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      message: 'Branxa handoff requires a git repository.'
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      message: initialized.message
    };
  }

  const defaultPromptSession = deps.prompt ? null : createPromptIfPossible();
  const prompt = deps.prompt ?? defaultPromptSession?.ask ?? null;

  try {
    const assignee = (assigneeArg?.trim() || (await askIfPossible(prompt, 'Assignee: ', '')).trim()).trim();
    const handoffNote = (noteArg?.trim() || (await askIfPossible(prompt, 'Handoff note: ', '')).trim()).trim();

    if (!assignee || !handoffNote) {
      return {
        ok: false,
        message: 'Handoff requires both assignee and note.'
      };
    }

    const branch = getCurrentBranch(cwd);
    const now = deps.now ?? (() => new Date());
    const config = await loadConfig(cwd);
    const history = sortByTimestampAsc(await readBranchEntries(cwd, branch));
    const latest = history[history.length - 1];

    const filesChanged = config.autoGitCapture ? getChangedFiles(cwd) : [];
    const filesStaged = config.autoGitCapture ? getStagedFiles(cwd) : [];
    const recentCommits = config.autoGitCapture ? getRecentCommits(cwd, config.recentCommitCount) : [];

    const entry: ContextEntry = {
      id: randomUUID(),
      timestamp: now().toISOString(),
      branch,
      repo: getRepoName(cwd),
      author: getGitAuthor(cwd),
      task: latest?.task || `Handoff to ${assignee}`,
      goal: latest?.goal || '',
      approaches: latest?.approaches ?? [],
      decisions: latest?.decisions ?? [],
      currentState: latest?.currentState || '(not specified)',
      nextSteps: latest?.nextSteps ?? [],
      blockers: latest?.blockers ?? [],
      filesChanged,
      filesStaged,
      recentCommits,
      assignee,
      handoffNote
    };

    await appendBranchEntry(cwd, entry);
    await saveSessionEntry(cwd, entry);

    return {
      ok: true,
      message: `Saved handoff for '${assignee}' on branch '${branch}'.`,
      entry
    };
  } finally {
    defaultPromptSession?.close();
  }
}

export function createHandoffCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('handoff')
    .description('Save teammate handoff details')
    .argument('[assignee]')
    .argument('[message]')
    .action(async (assignee: string | undefined, message: string | undefined) => {
      const result = await runHandoff(resolveCwd(), assignee, message);

      if (!result.ok) {
        console.error(result.message);
        process.exitCode = 1;
        return;
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
