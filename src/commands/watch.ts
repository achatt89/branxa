import { Command } from 'commander';

import { loadConfig } from '../lib/config';
import { assertInitialized } from '../lib/context-store';
import { getChangedFiles, isGitRepository } from '../lib/git';
import { runSave, type SaveResult } from './save';

export interface WatchCommandOptions {
  interval?: string;
}

export interface WatchDependencies {
  getChangedFiles?: (cwd: string) => string[];
  saveSnapshot?: (cwd: string) => Promise<SaveResult>;
  sleep?: (ms: number) => Promise<void>;
  maxTicks?: number;
}

export interface WatchResult {
  ok: boolean;
  message: string;
  ticks: number;
  autoSaves: number;
}

export async function runWatch(
  cwd: string,
  options: WatchCommandOptions,
  deps: WatchDependencies = {}
): Promise<WatchResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      message: 'Branxa watch requires a git repository.',
      ticks: 0,
      autoSaves: 0
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      message: initialized.message,
      ticks: 0,
      autoSaves: 0
    };
  }

  const config = await loadConfig(cwd);
  const intervalSeconds = normalizeInterval(options.interval, config.watchInterval);
  const getFiles = deps.getChangedFiles ?? getChangedFiles;
  const saveSnapshot = deps.saveSnapshot ?? ((root: string) => runSave(root, 'Auto-save (watch)', { state: 'watch snapshot' }));
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const maxTicks = deps.maxTicks ?? Number.POSITIVE_INFINITY;

  let ticks = 0;
  let autoSaves = 0;
  let previousSignature = signature(getFiles(cwd));

  while (ticks < maxTicks) {
    await sleep(intervalSeconds * 1000);
    ticks += 1;

    const currentSignature = signature(getFiles(cwd));
    if (currentSignature === previousSignature) {
      continue;
    }

    previousSignature = currentSignature;
    const saveResult = await saveSnapshot(cwd);
    if (saveResult.ok) {
      autoSaves += 1;
    }
  }

  return {
    ok: true,
    message: `Watch completed ${ticks} tick(s) and captured ${autoSaves} auto-save(s).`,
    ticks,
    autoSaves
  };
}

export function createWatchCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('watch')
    .description('Periodically capture context')
    .option('--interval <value>')
    .action(async (options: WatchCommandOptions) => {
      const config = await loadConfig(resolveCwd());
      const intervalSeconds = normalizeInterval(options.interval, config.watchInterval);
      console.log(`Watching for changes every ${intervalSeconds}s. Press Ctrl+C to stop.`);

      const result = await runWatch(resolveCwd(), options);
      if (!result.ok) {
        console.error(result.message);
        process.exitCode = 1;
      }
    });
}

function signature(files: string[]): string {
  return [...files].sort().join('\n');
}

function normalizeInterval(optionValue: string | undefined, fallback: number): number {
  const parsed = optionValue ? Number(optionValue) : fallback;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return Math.max(1, fallback);
  }

  return Math.max(1, Math.trunc(parsed));
}
