import { execFileSync } from 'node:child_process';
import { Command } from 'commander';

import { assertInitialized } from '../lib/context-store';
import { ensureBranxaGitignoreEntry, removeBranxaGitignoreEntry } from '../lib/gitignore';
import { isGitRepository } from '../lib/git';

export interface ShareCommandOptions {
  stop?: boolean;
}

export interface ShareResult {
  ok: boolean;
  message: string;
  committed: boolean;
}

export async function runShare(cwd: string, options: ShareCommandOptions): Promise<ShareResult> {
  if (!isGitRepository(cwd)) {
    return {
      ok: false,
      message: 'Branxa share requires a git repository.',
      committed: false
    };
  }

  const initialized = await assertInitialized(cwd);
  if (!initialized.ok) {
    return {
      ok: false,
      message: initialized.message,
      committed: false
    };
  }

  if (options.stop) {
    await ensureBranxaGitignoreEntry(cwd);

    return {
      ok: true,
      message: 'Stopped sharing .branxa by restoring .gitignore ignore entry.',
      committed: false
    };
  }

  const removed = await removeBranxaGitignoreEntry(cwd);
  if (!removed) {
    return {
      ok: true,
      message: '.branxa is already share-enabled (no ignore entry found).',
      committed: false
    };
  }

  try {
    execFileSync('git', ['add', '.gitignore'], { cwd, stdio: ['ignore', 'ignore', 'pipe'] });
    execFileSync('git', ['commit', '-m', 'chore(branxa): enable .branxa sharing'], {
      cwd,
      stdio: ['ignore', 'ignore', 'pipe']
    });

    return {
      ok: true,
      message: 'Enabled .branxa sharing and committed .gitignore update.',
      committed: true
    };
  } catch {
    return {
      ok: false,
      message: 'Failed to commit share update. Stage and commit .gitignore manually.',
      committed: false
    };
  }
}

export function createShareCommand(resolveCwd: () => string = () => process.cwd()): Command {
  return new Command('share')
    .description('Toggle Branxa storage sharing')
    .option('--stop')
    .action(async (options: ShareCommandOptions) => {
      const result = await runShare(resolveCwd(), options);

      if (!result.ok) {
        console.error(result.message);
        process.exitCode = 1;
        return;
      }

      console.log(result.message);
    });
}
