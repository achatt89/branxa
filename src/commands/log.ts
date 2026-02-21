import { Command } from 'commander';

import { loadConfig } from '../lib/config';
import { assertInitialized, readAllBranchEntries, readBranchEntries } from '../lib/context-store';
import { clampCount, sortByTimestampDesc } from '../lib/context-utils';
import { getCurrentBranch, isGitRepository } from '../lib/git';
import type { ContextEntry } from '../types';

export interface LogCommandOptions {
  all?: boolean;
  count?: string;
}

export interface LogResult {
  ok: boolean;
  message: string;
  lines: string[];
  entries: ContextEntry[];
}

export async function runLog(cwd: string, options: LogCommandOptions): Promise<LogResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      message: 'Branxa log requires a git repository.',
      lines: [],
      entries: []
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      message: initialized.message,
      lines: [],
      entries: []
    };
  }

  const config = await loadConfig(cwd);
  const requestedCount = options.count ? Number(options.count) : config.defaultLogCount;
  const count = clampCount(requestedCount);

  const entries = options.all ? await readAllBranchEntries(cwd) : await readBranchEntries(cwd, getCurrentBranch(cwd));
  const sorted = sortByTimestampDesc(entries).slice(0, count);

  if (sorted.length === 0) {
    return {
      ok: true,
      message: 'No saved context entries found.',
      lines: [],
      entries: []
    };
  }

  return {
    ok: true,
    message: `Showing ${sorted.length} context entr${sorted.length === 1 ? 'y' : 'ies'}.`,
    lines: sorted.map((entry) => formatEntry(entry)),
    entries: sorted
  };
}

export function createLogCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('log')
    .description('View context history')
    .option('--all')
    .option('--count <value>')
    .action(async (options: LogCommandOptions) => {
      const result = await runLog(resolveCwd(), options);

      if (!result.ok) {
        console.error(result.message);
        process.exitCode = 1;
        return;
      }

      if (result.lines.length === 0) {
        console.warn(result.message);
        return;
      }

      console.log(result.message);
      for (const line of result.lines) {
        console.log(line);
      }
    });
}

function formatEntry(entry: ContextEntry): string {
  return `${entry.timestamp} | ${entry.branch} | task=${entry.task} | state=${entry.currentState}`;
}
