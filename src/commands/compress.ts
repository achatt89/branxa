import { randomUUID } from 'node:crypto';
import { Command } from 'commander';

import { uniqueValues } from '../lib/arrays';
import { assertInitialized, readBranchEntries, writeBranchEntries } from '../lib/context-store';
import { getCurrentBranch, isGitRepository } from '../lib/git';
import { sortByTimestampAsc } from '../lib/context-utils';
import type { ContextEntry } from '../types';

export interface CompressDependencies {
  now?: () => Date;
}

export interface CompressResult {
  ok: boolean;
  message: string;
  beforeCount: number;
  afterCount: number;
}

export async function runCompress(cwd: string, deps: CompressDependencies = {}): Promise<CompressResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      message: 'Branxa compress requires a git repository.',
      beforeCount: 0,
      afterCount: 0
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      message: initialized.message,
      beforeCount: 0,
      afterCount: 0
    };
  }

  const branch = getCurrentBranch(cwd);
  const entries = sortByTimestampAsc(await readBranchEntries(cwd, branch));

  if (entries.length <= 2) {
    return {
      ok: false,
      message: 'Compression requires at least 3 context entries.',
      beforeCount: entries.length,
      afterCount: entries.length
    };
  }

  const latest = entries[entries.length - 1];
  const historical = entries.slice(0, -1);
  const now = deps.now ?? (() => new Date());

  const compressedEntry: ContextEntry = {
    id: randomUUID(),
    timestamp: now().toISOString(),
    branch,
    repo: latest.repo,
    author: latest.author,
    task: 'Compressed branch context history',
    goal: latest.goal,
    approaches: uniqueValues(historical.flatMap((entry) => entry.approaches)),
    decisions: uniqueValues(historical.flatMap((entry) => entry.decisions)),
    currentState: `Compressed ${historical.length} historical entries.`,
    nextSteps: uniqueValues(latest.nextSteps),
    blockers: uniqueValues([...historical.flatMap((entry) => entry.blockers), ...latest.blockers]),
    filesChanged: uniqueValues(historical.flatMap((entry) => entry.filesChanged)),
    filesStaged: uniqueValues(historical.flatMap((entry) => entry.filesStaged)),
    recentCommits: uniqueValues(historical.flatMap((entry) => entry.recentCommits)),
    compressed: true
  };

  const nextEntries = [compressedEntry, latest];
  await writeBranchEntries(cwd, branch, nextEntries);

  return {
    ok: true,
    message: `Compressed ${entries.length} entries to ${nextEntries.length} for branch '${branch}'.`,
    beforeCount: entries.length,
    afterCount: nextEntries.length
  };
}

export function createCompressCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('compress').description('Compress branch context history').action(async () => {
    const result = await runCompress(resolveCwd());

    if (!result.ok) {
      console.error(result.message);
      process.exitCode = 1;
      return;
    }

    console.log(result.message);
  });
}
